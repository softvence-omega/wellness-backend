import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../email/email.service';
import { Language } from '@prisma/client';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import jwkToPem from 'jwk-to-pem';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,


    ) { }

    // ---------------- REGISTER ----------------
    async register(dto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) {
            throw new BadRequestException('Email is already registered.');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                profile: {
                    create: {
                        fullName: dto.fullName,
                        language: dto.language as Language | undefined,
                        isEnableNotification: dto.isEnableNotification ?? false,
                    },
                },

                isAgreeTerms: dto.isAgreeTerms,
            },
            include: {
                profile: true,
            },
        });



        const { password, ...result } = user;
        return result;
    }

    async googleMobileLogin(googleUser: { email: string; name?: string; picture?: string }) {
        let user = await this.prisma.user.findUnique({ where: { email: googleUser.email } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: googleUser.email,
                    password: '', // no password for Google users
                    profile: { create: { fullName: googleUser.name || googleUser.email.split('@')[0], isEnableNotification: true, } },
                    isAgreeTerms: true,
                    
                },
                include: { profile: true },
            });
        }

        return this.generateToken(user.id, user.email, user.role);
    }




    // ---------------- LOGIN ----------------
    async login(dto: LoginUserDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        const token = this.generateToken(user.id, user.email, user.role);
        return token;
    }

    // ---------------- JWT TOKEN ----------------
    private generateToken(userId: number, email: string, role: string) {
        const payload = { userId, email, role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('User not found');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await this.prisma.user.update({
            where: { email },
            data: { otp, otpExpiry },
        });

        await this.mailService.sendEmailVerification(email, otp);
        return
    }

    async verifyOtp(email: string, otp: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            throw new BadRequestException('Invalid or expired OTP');
        }
        return
    }

    async resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null,
                changePasswordAt: new Date(),
            },
        });

        return
    }

    // ---------------- APPLE MOBILE LOGIN ----------------
    async appleMobileLogin(code: string) {
        // 1️⃣ Generate Apple client secret
        const clientSecret = this.generateAppleClientSecret();

        // 2️⃣ Exchange code for tokens
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: process.env.APPLE_CLIENT_ID as string,
            client_secret: clientSecret as string,
        });


        const resp = await axios.post('https://appleid.apple.com/auth/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { id_token } = resp.data;
        if (!id_token) throw new UnauthorizedException('Apple login failed');

        // 3️⃣ Verify & decode Apple ID token
        const appleUser = await this.verifyAppleIdToken(id_token);

        // 4️⃣ Find or create user
        let user = await this.prisma.user.findUnique({ where: { email: appleUser.email } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: appleUser.email,
                    password: '', // Apple login users don't need password
                    profile: { create: { fullName: appleUser.name || appleUser.email.split('@')[0],  isEnableNotification: true, } },
                    isAgreeTerms: true,
                   
                },
                include: { profile: true },
            });
        }

        // 5️⃣ Issue your app JWT
        return this.generateToken(user.id, user.email, user.role);
    }

    private generateAppleClientSecret() {
        const privateKey = fs.readFileSync(path.resolve(process.env.APPLE_PRIVATE_KEY_PATH as string)).toString();

        const claims = {
            iss: process.env.APPLE_TEAM_ID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 15777000, // up to 6 months
            aud: 'https://appleid.apple.com',
            sub: process.env.APPLE_CLIENT_ID,
        };

        return jwt.sign(claims, privateKey, {
            algorithm: 'ES256',
            header: {
                alg: 'ES256', // explicitly required
                kid: process.env.APPLE_KEY_ID as string,
            },
        });
    }

    private async verifyAppleIdToken(idToken: string) {
        const decodedHeader: any = jwt.decode(idToken, { complete: true })?.header;
        if (!decodedHeader || !decodedHeader.kid) {
            throw new UnauthorizedException('Invalid id_token');
        }

        const jwksResp = await axios.get('https://appleid.apple.com/auth/keys');
        const jwk = jwksResp.data.keys.find((k: any) => k.kid === decodedHeader.kid);
        if (!jwk) throw new UnauthorizedException('Invalid Apple public key');

        const pem = jwkToPem(jwk);
        const payload: any = jwt.verify(idToken, pem, { algorithms: ['RS256'] });

        return {
            email: payload.email,
            emailVerified: payload.email_verified,
            appleId: payload.sub,
            name: payload.name, // may not always be present
        };
    }

}

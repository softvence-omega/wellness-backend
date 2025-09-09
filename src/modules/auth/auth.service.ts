import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../email/email.service';
import { Language } from '@prisma/client';

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
                    },
                },
                language: dto.language as Language | undefined,
                isAgreeTerms: dto.isAgreeTerms,
                isEnableNotification: dto.isEnableNotification ?? false,
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
                    profile: { create: { fullName: googleUser.name || googleUser.email.split('@')[0] } },
                    isAgreeTerms: true,
                    isEnableNotification: true,
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
}

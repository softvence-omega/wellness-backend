import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../email/email.service';
import { Language, Role } from '@prisma/client';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

interface GoogleUser {
  email: string;
  name?: string;
  picture?: string;
}

interface AppleUser {
  email: string;
  emailVerified: boolean;
  appleId: string;
  name?: string;
}

type JwtDuration = '1s' | '1m' | '1h' | '1d' | '7d' | '30d' | '1y';
type JwtExpiresIn = number | JwtDuration | undefined;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private accessTokenExpiresIn: JwtExpiresIn;
  private refreshTokenExpiresIn: JwtExpiresIn;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    this.validateEnvVars();
  }

  private validateEnvVars() {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'APPLE_CLIENT_ID',
      'APPLE_TEAM_ID',
      'APPLE_KEY_ID',
      'APPLE_PRIVATE_KEY', // Removed APPLE_PRIVATE_KEY_PATH
    ];

    for (const envVar of requiredVars) {
      if (!this.configService.get<string>(envVar)) {
        this.logger.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    const validateJwtDuration = (
      value: string | undefined,
      name: string,
      defaultValue: JwtDuration,
    ): JwtExpiresIn => {
      if (!value) {
        this.logger.warn(`Using default ${name}: ${defaultValue}`);
        return defaultValue;
      }
      if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
      }
      if (/^\d+[smhdwMy]$/.test(value)) {
        return value as JwtDuration;
      }
      throw new Error(
        `Invalid ${name}: must be a number or valid JWT duration (e.g., '3600', '1h', '30d')`,
      );
    };

    this.accessTokenExpiresIn = validateJwtDuration(
      this.configService.get<string>('ACCESS_TOKEN_EXPIREIN'),
      'ACCESS_TOKEN_EXPIREIN',
      '1h',
    );
    this.refreshTokenExpiresIn = validateJwtDuration(
      this.configService.get<string>('REFRESH_TOKEN_EXPIREIN'),
      'REFRESH_TOKEN_EXPIREIN',
      '30d',
    );

    if (!this.configService.get<string>('JWT_ISSUER')) {
      this.logger.warn('JWT_ISSUER not set, using default: my-app');
    }
    if (!this.configService.get<string>('JWT_AUDIENCE')) {
      this.logger.warn('JWT_AUDIENCE not set, using default: my-app-users');
    }
  }

  async register(dto: CreateUserDto) {
    this.logger.log(`Register attempt for email: ${dto.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email, isDeleted: false },
      select: { id: true },
    });
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (prisma) => {
      return prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: Role.USER,
          profile: {
            create: {
              fullName: dto.fullName,
              language: (dto.language as Language) || Language.EN,
              isEnableNotification: dto.isEnableNotification ?? false,
            },
          },
          isAgreeTerms: dto.isAgreeTerms ?? false,
        },
        select: {
          id: true,
          email: true,
          role: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    return { message: 'User registered successfully', user };
  }

  async googleMobileLogin(googleUser: GoogleUser) {
    this.logger.log(`Google login attempt for email: ${googleUser.email}`);

    if (!googleUser.email) {
      throw new BadRequestException('Google user email is required');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email, isDeleted: false },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      user = await this.createUser({
        email: googleUser.email,
        fullName: googleUser.name || googleUser.email.split('@')[0],
        isSocialLogin: true,
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { message: 'Google login successful', tokens, userId: user.id };
  }

  async login(dto: LoginUserDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, isDeleted: false },
      select: { id: true, email: true, password: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Account requires social login');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { message: 'Login successful', tokens, userId: user.id };
  }

  private async generateTokens(userId: number, email: string, role: Role) {
    const payload = {
      sub: userId.toString(),
      email,
      role: role.toString(),
      iss: this.configService.get<string>('JWT_ISSUER') || 'my-app',
      aud: this.configService.get<string>('JWT_AUDIENCE') || 'my-app-users',
    };

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_SECRET')!,
          expiresIn: this.accessTokenExpiresIn,
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
          expiresIn: this.refreshTokenExpiresIn,
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (err) {
      this.logger.error(`Token generation error: ${err.message}`);
      throw new UnauthorizedException('Failed to generate tokens');
    }
  }

  async forgotPassword(email: string) {
    this.logger.log(`Forgot password request for email: ${email}`);

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    await this.mailService.sendEmailVerification(email, otp);
    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, otp: string) {
    this.logger.log(`OTP verification attempt for email: ${email}`);

    if (!email || !otp) {
      throw new BadRequestException('Email and OTP are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      select: { otp: true, otpExpiry: true },
    });
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
    this.logger.log(`Password reset attempt for email: ${email}`);

    if (!email || !otp || !newPassword) {
      throw new BadRequestException('Email, OTP, and new password are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      select: { id: true, otp: true, otpExpiry: true },
    });
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

    return { message: 'Password reset successfully' };
  }

  async appleMobileLogin(code: string) {
    this.logger.log('Apple mobile login attempt');

    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const clientSecret = await this.generateAppleClientSecret();
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.configService.get<string>('APPLE_CLIENT_ID')!,
        client_secret: clientSecret,
      });

      const resp = await axios.post('https://appleid.apple.com/auth/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { id_token } = resp.data;
      if (!id_token) {
        throw new UnauthorizedException('Apple login failed: No ID token received');
      }

      const appleUser = await this.verifyAppleIdToken(id_token);
      let user = await this.prisma.user.findUnique({
        where: { email: appleUser.email, isDeleted: false },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        user = await this.createUser({
          email: appleUser.email,
          fullName: appleUser.name || appleUser.email.split('@')[0],
          isSocialLogin: true,
        });
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return { message: 'Apple login successful', tokens, userId: user.id };
    } catch (error) {
      this.logger.error(`Apple login failed: ${error.message}`);
      throw new UnauthorizedException(`Apple login failed: ${error.message}`);
    }
  }

  async refreshTokens(userId: number, refreshToken: string) {
    this.logger.log(`Token refresh attempt for userId: ${userId}`);

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true, email: true, role: true, refreshToken: true },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied: No refresh token found');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const refreshMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { message: 'Tokens refreshed successfully', tokens, userId: user.id };
  }

  private async createUser(data: { email: string; fullName: string; isSocialLogin: boolean }) {
    return this.prisma.$transaction(async (prisma) => {
      return prisma.user.create({
        data: {
          email: data.email,
          password: data.isSocialLogin ? undefined : '',
          role: Role.USER,
          profile: {
            create: {
              fullName: data.fullName,
              isEnableNotification: true,
              language: Language.EN,
            },
          },
          isAgreeTerms: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
    });
  }

  private async generateAppleClientSecret() {
    try {
      const privateKey = this.configService.get<string>('APPLE_PRIVATE_KEY')!;
      const claims = {
        iss: this.configService.get<string>('APPLE_TEAM_ID')!,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 15777000,
        aud: 'https://appleid.apple.com',
        sub: this.configService.get<string>('APPLE_CLIENT_ID')!,
      };

      return jwt.sign(claims, privateKey, {
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: this.configService.get<string>('APPLE_KEY_ID')!,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to generate Apple client secret: ${error.message}`);
      throw new Error(`Failed to generate Apple client secret: ${error.message}`);
    }
  }

  private async verifyAppleIdToken(idToken: string): Promise<AppleUser> {
    try {
      const decodedHeader: any = jwt.decode(idToken, { complete: true })?.header;
      if (!decodedHeader || !decodedHeader.kid) {
        throw new Error('Invalid id_token: Missing header or kid');
      }

      const jwksResp = await axios.get('https://appleid.apple.com/auth/keys');
      const jwk = jwksResp.data.keys.find((k: any) => k.kid === decodedHeader.kid);
      if (!jwk) {
        throw new Error('Invalid Apple public key');
      }

      const pem = jwkToPem(jwk);
      const payload: any = jwt.verify(idToken, pem, { algorithms: ['RS256'] });

      if (!payload.email) {
        throw new Error('Invalid id_token: Missing email');
      }

      return {
        email: payload.email,
        emailVerified: payload.email_verified === 'true',
        appleId: payload.sub,
        name: payload.name,
      };
    } catch (error) {
      this.logger.error(`Apple ID token verification failed: ${error.message}`);
      throw new UnauthorizedException(`Apple ID token verification failed: ${error.message}`);
    }
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefresh },
    });
  }
}
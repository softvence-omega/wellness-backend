import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../email/email.service';
import { Language, Role, Gender } from '@prisma/client';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { OAuth2Client } from 'google-auth-library';

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
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    this.validateEnvVars();
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  private validateEnvVars() {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'APPLE_CLIENT_ID',
      'APPLE_TEAM_ID',
      'APPLE_KEY_ID',
      'APPLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_ID', // Added for Google token validation
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
              height: dto.height ?? null,
              weight: dto.weight ?? null,
              dateOfBirth: dto.dateOfBirth ?? null,
              gender: dto.gender ?? null,
            },
          },
          isAgreeTerms: dto.isAgreeTerms ?? false,
        },
        select: {
          id: true, // CUID string
          email: true,
          role: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
        },
      });

 
    });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { message: 'User registered successfully', user, tokens };
  }

   async registerAdmin(dto: CreateUserDto, secretKey: string): Promise<{ message: string; user: any }> {
    this.logger.log(`Admin registration attempt for email: ${dto.email}`);

    // Verify secret key from environment
    const adminSecret = this.configService.get<string>('ADMIN_REGISTRATION_SECRET');
    if (!adminSecret || secretKey !== adminSecret) {
      throw new BadRequestException('Invalid admin registration secret');
    }

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
          role: Role.ADMIN, // Set as ADMIN
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

    return { message: 'Admin user registered successfully', user };
  }

  // Admin: Create user with specific role (only ADMIN can do this)
  async createUserWithRole(dto: CreateUserDto & { role: Role }, adminUserId: string): Promise<{ message: string; user: any }> {
    this.logger.log(`Admin ${adminUserId} creating user with role: ${dto.role}`);

    // Verify admin permissions
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId, isDeleted: false },
      select: { role: true },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can create users with specific roles');
    }

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
          role: dto.role, // Use the specified role
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

    return { message: `User created successfully with ${dto.role} role`, user };
  }

  // Admin: Update user role
  async updateUserRole(adminUserId: string, userId: string, newRole: Role): Promise<{ message: string; user: any }> {
    this.logger.log(`Admin ${adminUserId} updating user ${userId} role to ${newRole}`);

    // Verify admin permissions
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId, isDeleted: false },
      select: { role: true },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can update user roles');
    }

    // Prevent admin from modifying their own role
    if (adminUserId === userId) {
      throw new BadRequestException('Cannot modify your own role');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return { message: 'User role updated successfully', user: updatedUser };
  }

  // Get user role
  async getUserRole(userId: string): Promise<{ role: Role }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { role: user.role };
  }

  // Check if user is admin
  async isUserAdmin(userId: string): Promise<{ isAdmin: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { isAdmin: user.role === Role.ADMIN };
  }

  async googleMobileLogin(idToken: string): Promise<{ message: string; tokens: { accessToken: string; refreshToken: string }; userId: string }> {
    this.logger.log(`Google login attempt with idToken`);

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Google user email is required');
      }

      const googleUser: GoogleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

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
    } catch (error) {
      this.logger.error(`Google login failed: ${error.message}`);
      throw new UnauthorizedException(`Google login failed: ${error.message}`);
    }
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

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = {
      sub: userId, // CUID string
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

  async refreshTokens(userId: string, refreshToken: string) {
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
          id: true, // CUID string
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
        exp: Math.floor(Date.now() / 1000) + 15777000, // ~6 months
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

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefresh },
    });
  }
}
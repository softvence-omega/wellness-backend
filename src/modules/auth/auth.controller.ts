import {
  Controller,
  Post,
  Body,
  HttpException,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
  Get,
  Req,
  Put,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { successResponse } from 'src/common/response';
import { CreateUserDto } from './dto/create-user.dto';
import {
  AppleMobileLoginDto,
  ForgotPasswordDto,
  GoogleMobileLoginDto,
  LoginUserDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/role-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRequest } from 'src/common/type/users.types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  private handleError(error: any, context: string): never {
    this.logger.error(`Error in ${context}: ${error.message}`, {
      stack: error.stack,
      context,
      input: JSON.stringify(error.input || {}),
    });

    if (error instanceof HttpException) {
      throw error;
    }

    if (error.code === 'P2002') {
      throw new BadRequestException('User already exists with this email');
    }

    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    throw new InternalServerErrorException(
      `An error occurred during ${context}`,
    );
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log(`Register attempt for email: ${createUserDto.email}`);
      const result = await this.authService.register(createUserDto);
      return successResponse(result, 'Registration successful');
    } catch (error) {
      error.input = createUserDto;
      this.handleError(error, 'register');
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      this.logger.log(`Login attempt for email: ${loginUserDto.email}`);
      const result = await this.authService.login(loginUserDto);
      return successResponse(result, 'Login successful');
    } catch (error) {
      error.input = loginUserDto;
      this.handleError(error, 'login');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    try {
      this.logger.log(`Forgot password request for email: ${dto.email}`);
      const result = await this.authService.forgotPassword(dto.email);
      return successResponse(result, 'OTP sent to email');
    } catch (error) {
      error.input = dto;
      this.handleError(error, 'forgot-password');
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    try {
      this.logger.log(`OTP verification attempt for email: ${dto.email}`);
      const result = await this.authService.verifyOtp(dto.email, dto.otp);
      return successResponse(result, 'OTP verified successfully');
    } catch (error) {
      error.input = dto;
      this.handleError(error, 'verify-otp');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      this.logger.log(`Password reset attempt for email: ${dto.email}`);
      const result = await this.authService.resetPasswordWithOtp(
        dto.email,
        dto.otp,
        dto.newPassword,
      );
      return successResponse(result, 'Password reset successfully');
    } catch (error) {
      error.input = { email: dto.email, otp: dto.otp };
      this.handleError(error, 'reset-password');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    try {
      this.logger.log(`Password change attempt for userId: ${req.user.userId}`);
      const result = await this.authService.changePassword(
        req.user.userId,
        dto.oldPassword,
        dto.newPassword,
      );
      return successResponse(result, 'Password changed successfully');
    } catch (error) {
      error.input = { userId: req.user.userId };
      this.handleError(error, 'change-password');
    }
  }

  @Post('register-admin')
  async registerAdmin(@Body() dto: CreateUserDto & { secretKey: string }) {
    return this.authService.registerAdmin(dto, dto.secretKey);
  }
  @UseGuards(JwtAuthGuard)
  @Get('my-role')
  async getMyRole(@Req() req: any) {
    return this.authService.getUserRole(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-admin')
  async isAdmin(@Req() req: any) {
    return this.authService.isUserAdmin(req.user.userId);
  }

  // Admin-only endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('users/with-role')
  async createUserWithRole(
    @Req() req: any,
    @Body() dto: CreateUserDto & { role: Role },
  ) {
    return this.authService.createUserWithRole(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('users/:userId/role')
  async updateUserRole(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body('role') role: Role,
  ) {
    return this.authService.updateUserRole(req.user.userId, userId, role);
  }

  // @Post('google-mobile-login')
  // async googleMobileLogin(@Body() dto: GoogleMobileLoginDto) {
  //   try {
  //     this.logger.log(`Google mobile login attempt`);
  //     const googleUser = await this.googleService.verifyGoogleToken(dto.idToken);
  //     const result = await this.authService.googleMobileLogin(googleUser);
  //     return successResponse(result, 'Google login successful');
  //   } catch (error) {
  //     error.input = { idToken: dto.idToken };
  //     this.handleError(error, 'google-mobile-login');
  //   }
  // }

  @Post('apple-mobile-login')
  async appleMobileLogin(@Body() dto: AppleMobileLoginDto) {
    try {
      this.logger.log(`Apple mobile login attempt`);
      const result = await this.authService.appleMobileLogin(dto.code);
      return successResponse(result, 'Apple login successful');
    } catch (error) {
      error.input = { code: dto.code };
      this.handleError(error, 'apple-mobile-login');
    }
  }

  @Post('get-new-access-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    try {
      this.logger.log(`Token refresh attempt for userId: ${dto.userId}`);
      const result = await this.authService.refreshTokens(
        dto.userId,
        dto.refreshToken,
      );
      return successResponse(result, 'Access token refreshed successfully');
    } catch (error) {
      error.input = { userId: dto.userId };
      this.handleError(error, 'refresh-token');
    }
  }
}

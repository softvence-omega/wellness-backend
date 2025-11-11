import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;




  
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'One-time password (OTP) sent to email',
    example: '123456',
    minLength: 4,
  })
  @IsString({ message: 'OTP must be a string' })
  @MinLength(4, { message: 'OTP must be at least 4 characters long' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'One-time password (OTP) for verification',
    example: '123456',
    minLength: 4,
  })
  @IsString({ message: 'OTP must be a string' })
  @MinLength(4, { message: 'OTP must be at least 4 characters long' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'newPassword123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @IsNotEmpty({ message: 'Password is required' })
  newPassword: string;
}

export class GoogleMobileLoginDto {
  @ApiProperty({
    description: 'Google ID token from mobile app',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTQy...',
    minLength: 10,
  })
  @IsString({ message: 'ID token must be a string' })
  @MinLength(10, { message: 'Invalid ID token format' })
  @IsNotEmpty({ message: 'ID token is required' })
  idToken: string;
}

export class AppleMobileLoginDto {
  @ApiProperty({
    description: 'Apple authorization code from mobile app',
    example: 'c8a3d2b1a9f7e6d5c4b3a2f1e0d9c8b7...',
    minLength: 10,
  })
  @IsString({ message: 'Authorization code must be a string' })
  @MinLength(10, { message: 'Invalid authorization code format' })
  @IsNotEmpty({ message: 'Authorization code is required' })
  code: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'User ID (CUID format)',
    example: 'cln5a6z8k000008l0a1a2b3c4',
  })
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'Refresh token to get new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    minLength: 10,
  })
  @IsString({ message: 'Refresh token must be a string' })
  @MinLength(10, { message: 'Invalid refresh token format' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

// Additional DTOs for better API documentation
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for getting new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'cln5a6z8k000008l0a1a2b3c4',
      email: 'user@example.com',
      role: 'USER',
    },
  })
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class OtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'OTP expiration time in seconds',
    example: 300,
  })
  expiresIn: number;
}

export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successfully',
  })
  message: string;
}

import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  @MinLength(4, { message: 'OTP must be at least 4 characters long' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  @MinLength(4, { message: 'OTP must be at least 4 characters long' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @IsNotEmpty({ message: 'Password is required' })
  newPassword: string;
}

export class GoogleMobileLoginDto {
  @IsString({ message: 'ID token must be a string' })
  @MinLength(10, { message: 'Invalid ID token format' })
  @IsNotEmpty({ message: 'ID token is required' })
  idToken: string;
}

export class AppleMobileLoginDto {
  @IsString({ message: 'Authorization code must be a string' })
  @MinLength(10, { message: 'Invalid authorization code format' })
  @IsNotEmpty({ message: 'Authorization code is required' })
  code: string;
}

export class RefreshTokenDto {
  @IsString({ message: 'User ID must be a string' }) // Changed to string
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string; // Changed to string for CUID

  @IsString({ message: 'Refresh token must be a string' })
  @MinLength(10, { message: 'Invalid refresh token format' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
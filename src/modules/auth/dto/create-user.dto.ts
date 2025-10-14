import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'Full name must be a string' })
  @IsOptional()
  fullName?: string;

  @IsEnum(Language, { message: 'Invalid language' })
  @IsOptional()
  language?: Language;

  @IsBoolean({ message: 'isAgreeTerms must be a boolean' })
  @IsOptional()
  isAgreeTerms?: boolean;

  @IsBoolean({ message: 'isEnableNotification must be a boolean' })
  @IsOptional()
  isEnableNotification?: boolean;
}
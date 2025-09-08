import { IsEmail, IsNotEmpty, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  language?: string;

  @IsBoolean()
  isAgreeTerms: boolean;

  @IsOptional()
  isEnableNotification?: boolean; // Optional, user can choose
}

import { IsOptional, IsString, IsDateString, IsEnum, IsNumberString, IsBoolean } from 'class-validator';
import { Gender, HealthGoal } from '@prisma/client';

// 👇 match your Role enum from Prisma
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// 👇 match your Language enum from Prisma
export enum Language {
  EN = 'EN',
  BN = 'BN',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsNumberString()
  height?: string;

  @IsOptional()
  @IsNumberString()
  weight?: string;

  @IsOptional()
  @IsEnum(HealthGoal)
  healthGoal?: HealthGoal;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsBoolean()
  isEnableNotification?: boolean;



  @IsOptional()
  @IsEnum(Language, { message: 'Language must be EN or BN' })
  language?: Language;
}




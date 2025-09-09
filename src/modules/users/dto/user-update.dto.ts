import { IsOptional, IsString, IsDateString, IsEnum, IsNumberString } from 'class-validator';
import { Gender, HealthGoal } from '@prisma/client';

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
}



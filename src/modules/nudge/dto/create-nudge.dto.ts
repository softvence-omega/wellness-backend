import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { NudgeCategory } from '@prisma/client';

export class CreateNudgeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsEnum(NudgeCategory)
  category: NudgeCategory;

  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  schedule?: string;
}

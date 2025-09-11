import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { NudgeCategory } from '@prisma/client';

export class CreateNudgeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsEnum(NudgeCategory)
  category: NudgeCategory;

  @IsNumber()
  targetAmount: number;

  @IsString()
  unit: string;

  @IsString()
  schedule: string;
}

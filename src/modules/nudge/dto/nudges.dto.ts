import { 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsDate,
  Min,
  Max,
  IsPositive,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NudgeCategory, NudgeUnit } from '@prisma/client';

export class CreateNudgeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(NudgeCategory)
  category: NudgeCategory;

  @IsNumber()
  @IsPositive()
  @Min(0.1)
  targetAmount: number;

  @IsEnum(NudgeUnit)
  unit: NudgeUnit;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}

export class UpdateNudgeProgressDto {
  @IsNumber()
  @Min(0)
  consumedAmount: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class UpdateNudgeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsEnum(NudgeCategory)
  category?: NudgeCategory;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0.1)
  targetAmount?: number;

  @IsOptional()
  @IsEnum(NudgeUnit)
  unit?: NudgeUnit;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}

export class GetNudgesQueryDto {
  @IsOptional()
  @IsEnum(NudgeCategory)
  category?: NudgeCategory;

  @IsOptional()
  @IsString()
  @Matches(/^(\d{4}-\d{2}-\d{2}|upcoming)$/, {
    message: 'Date must be in YYYY-MM-DD format (e.g., 2025-10-25) or "upcoming"',
  })
  date?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  completed?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeTips?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class NudgeIdParamDto {
  @IsString()
  nudgeId: string;
}

export class DateQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}
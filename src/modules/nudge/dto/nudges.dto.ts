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
import { ApiProperty } from '@nestjs/swagger';

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

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,2})?$/)
  time?: string;
}

export class GetNudgesQueryDto {
  @IsOptional()
  @IsEnum(NudgeCategory)
  category?: NudgeCategory;

  @ApiProperty({
    description:
      'Filter nudges: "upcoming" for on or after today, "today" for today only, or YYYY-MM-DD for on or after the specified date',
    required: false,
    example: 'today',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{4}-\d{2}-\d{2}|upcoming|today)$/, {
    message:
      'Date must be in YYYY-MM-DD format (e.g., 2025-10-25), "upcoming", or "today"',
  })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,2})?$/)
  @ApiProperty({
    description: 'Filter nudges by exact time (HH:mm:ss)',
    example: '20:00:00',
    required: false,
  })
  time?: string;

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

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,2})?$/)
  time?: string;
}

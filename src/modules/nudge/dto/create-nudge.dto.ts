// dto/create-nudge.dto.ts
import { IsString, IsEnum, IsNumber, IsOptional, IsDate, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { NudgeCategory } from '@prisma/client';
import { NudgeUnit } from 'src/common/enums';

export class CreateNudgeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(NudgeCategory)
  category: NudgeCategory;

  @IsNumber()
  @Min(0.1)
  targetAmount: number;

  @IsEnum(NudgeUnit)
  unit: NudgeUnit;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}
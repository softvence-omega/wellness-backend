import { IsEnum, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { NudgeCategory } from '@prisma/client';

export class NudgeQueryDto {
  @IsOptional()
  @IsEnum(NudgeCategory)
  category?: NudgeCategory;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  completed?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeTips?: boolean;
}
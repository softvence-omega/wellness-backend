import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDate,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NudgeCategory } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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
  includeTips?: boolean;
}

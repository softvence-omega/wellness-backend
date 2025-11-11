// src/nudges/dto/create-nudge.dto.ts
import { IsString, IsEnum, IsNumber, IsOptional, Matches } from 'class-validator';
import { NudgeCategory, NudgeUnit } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNudgeDto {
  @IsString()
  @ApiProperty({ example: 'Sleep 8 hours' })
  title: string;

  @IsEnum(NudgeCategory, {
    message: 'category must be one of: hydration, sleep, movement, weight, other',
  })
  @ApiProperty({ enum: NudgeCategory, example: 'sleep' })
  category: NudgeCategory;

  @IsNumber()
  @ApiProperty({ example: 8 })
  targetAmount: number;

  @IsEnum(NudgeUnit)
  @ApiProperty({ enum: NudgeUnit, example: 'HOURS' })
  unit: NudgeUnit;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ApiProperty({ example: '2025-11-11', required: false })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,2})?$/)
  @ApiProperty({ example: '22:00:00', required: false })
  time?: string;
}

// // dto/create-nudge.dto.ts
// import {
//   IsString,
//   IsEnum,
//   IsNumber,
//   IsOptional,
//   IsDate,
//   Min,
//   IsNotEmpty,
//   Matches,
// } from 'class-validator';
// import { Type } from 'class-transformer';
// import { NudgeCategory, NudgeUnit } from '@prisma/client';
// import { ApiProperty } from '@nestjs/swagger';

// export class CreateNudgeDto {
//   @IsString()
//   @IsNotEmpty()
//   title: string;

//   @IsEnum(NudgeCategory)
//   category: NudgeCategory;

//   @IsNumber()
//   @Min(0.1)
//   targetAmount: number;

//   @IsEnum(NudgeUnit)
//   unit: NudgeUnit;

//   @IsOptional()
//   @IsDate()
//   @Type(() => Date)
//   date?: Date;

  
//   @IsOptional()
//   @IsString()
//   @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d{1,2})?$/, {
//     message: 'time must be in HH:mm:ss or HH:mm:ss.SS format',
//   })
//   @ApiProperty({
//     description: 'Optional time of the nudge (24-hour format, e.g. "20:00:00")',
//     example: '20:00:00',
//     required: false,
//   })
//   time?: string;
// }

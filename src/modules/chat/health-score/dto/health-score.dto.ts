import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthScoreDto {
  @ApiProperty({ description: 'Health score (0-100)', example: 85 })
  @IsInt()
  @IsOptional()
  health_score?: number;

  @ApiProperty({ description: 'AI analysis text', example: 'Great improvement in sleep!' })
  @IsString()
  @IsOptional()
  analysis?: string;

  @ApiProperty({ description: 'ISO date (optional)', example: '2025-11-05' })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class HealthScoreResponseDto {
  @ApiProperty({ example: 'clg5abcd123efgh456ijkl' })
  id!: string;

  @ApiProperty({ example: 85, required: false })
  health_score!: number | null;

  @ApiProperty({ example: 'Great improvement in sleep!', required: false })
  analysis!: string | null;

  @ApiProperty({ example: '2025-11-05T00:00:00.000Z' })
  date!: string;

  @ApiProperty({ example: '2025-11-05T06:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-11-05T06:30:00.000Z' })
  updatedAt!: string;
}
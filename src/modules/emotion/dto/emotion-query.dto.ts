// src/emotions/dto/emotion-query.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class EmotionQueryDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsEnum(['today', 'week', 'month'])
  range?: 'today' | 'week' | 'month';

  @IsOptional()
  @IsString()
  emoji?: string;
}

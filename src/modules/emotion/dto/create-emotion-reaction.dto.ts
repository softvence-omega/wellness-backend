// src/emotions/dto/create-emotion.dto.ts
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateEmotionDto {
  @IsString()
  userId: string;

  @IsString()
  emoji: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  intensity?: number = 5;
}

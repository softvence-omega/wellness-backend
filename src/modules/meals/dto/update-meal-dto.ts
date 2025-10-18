import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsBoolean, Min, Max } from 'class-validator';
import { MealType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMealDto {
  @ApiPropertyOptional({
    description: 'Meal photo URL',
    example: 'https://example.com/updated-meal-photo.jpg',
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({
    description: 'Name of the meal',
    example: 'Updated Chicken Salad',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of meal',
    enum: MealType,
    example: MealType.DINNER,
  })
  @IsOptional()
  @IsEnum(MealType, { message: 'Invalid meal type' })
  mealType?: MealType;

  @ApiPropertyOptional({
    description: 'Additional notes about the meal',
    example: 'Reduced dressing amount',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Calories in the meal',
    example: 400,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Calories cannot be negative' })
  @Max(10000, { message: 'Calories seem too high' })
  @Type(() => Number)
  calories?: number;

  @ApiPropertyOptional({
    description: 'Protein content in grams',
    example: 30,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Protein cannot be negative' })
  @Max(1000, { message: 'Protein seems too high' })
  @Type(() => Number)
  protein?: number;

  @ApiPropertyOptional({
    description: 'Description of the meal',
    example: 'Updated description with more details',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Carbohydrates content in grams',
    example: 25,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Carbs cannot be negative' })
  @Max(1000, { message: 'Carbs seem too high' })
  @Type(() => Number)
  carbs?: number;

  @ApiPropertyOptional({
    description: 'Fats content in grams',
    example: 12,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Fats cannot be negative' })
  @Max(1000, { message: 'Fats seem too high' })
  @Type(() => Number)
  fats?: number;

  @ApiPropertyOptional({
    description: 'Time when the meal was consumed (ISO 8601 format)',
    example: '2024-01-15T13:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Time must be a valid ISO 8601 date string' })
  time?: string;

  @ApiPropertyOptional({
    description: 'Whether the meal is completed',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCompleted?: boolean;
}
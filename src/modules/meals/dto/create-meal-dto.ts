import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { MealType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealDto {
  @ApiPropertyOptional({
    description: 'Meal photo URL',
    example: 'https://example.com/meal-photo.jpg',
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({
    description: 'Name of the meal',
    example: 'Chicken Salad',
  })
  @IsNotEmpty({ message: 'Meal name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of meal',
    enum: MealType,
    example: MealType.LUNCH,
  })
  @IsEnum(MealType, { message: 'Invalid meal type' })
  mealType: MealType;

  @ApiPropertyOptional({
    description: 'Additional notes about the meal',
    example: 'Added extra vegetables',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Calories in the meal',
    example: 450,
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
    example: 25,
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
    example: 'Fresh garden salad with grilled chicken',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Carbohydrates content in grams',
    example: 30,
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
    example: 15,
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
    example: '2024-01-15T12:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Time must be a valid ISO 8601 date string' })
  time?: string;
}

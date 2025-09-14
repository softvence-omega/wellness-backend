import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MealType } from '@prisma/client';

export class CreateMealDto {
  @IsOptional()
  @IsString()
  photo?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  calories?: string;

  @IsOptional()
  @IsString()
  protein?: string;

  @IsOptional()
  @IsString()
  carbs?: string;

  @IsOptional()
  @IsString()
  fats?: string;

  @IsOptional()
  @IsString()
  time?: string;
}

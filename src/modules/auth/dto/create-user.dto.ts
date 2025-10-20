import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Gender, HealthGoal, Language } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password is too long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString({ message: 'Full name must be a string' })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Preferred language',
    enum: Language,
    example: Language.EN,
  })
  @IsEnum(Language, { message: 'Invalid language' })
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({
    description: 'Whether user agreed to terms and conditions',
    example: true,
    default: false,
  })
  @IsBoolean({ message: 'isAgreeTerms must be a boolean' })
  @IsOptional()
  isAgreeTerms?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to enable notifications',
    example: true,
    default: false,
  })
  @IsBoolean({ message: 'isEnableNotification must be a boolean' })
  @IsOptional()
  isEnableNotification?: boolean;

  @ApiPropertyOptional({
    description: 'User height in cm',
    example: 180,
    default: null,
  })
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'User weight in kg',
    example: 75,
    default: null,
  })
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'User date of birth',
    example: '1990-01-01',
    default: null,
  })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'User gender',
    example: 'male',
    default: null,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be one of: MALE, FEMALE, OTHER' })
  gender?: Gender | null;
  

  @ApiPropertyOptional({
    description: 'User health goal',
    example: 'Lose weight',
    maxLength: 255,
    default: null,
  })
  @IsString({ message: 'Health goal must be a string' })
  @IsOptional()
  @IsEnum(HealthGoal, { message: 'Invalid health goal' })
  healthGoal?: HealthGoal | null;
}

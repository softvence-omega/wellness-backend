import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CursorDto {
  @ApiPropertyOptional({
    description: 'Number of items to take',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Take must be at least 1' })
  @Max(100, { message: 'Take cannot exceed 100' })
  take?: number;

  @ApiPropertyOptional({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  cursor: string;
}

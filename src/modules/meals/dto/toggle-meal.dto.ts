import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ToggleMealDto {
  @ApiPropertyOptional({
    description: 'New completed status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
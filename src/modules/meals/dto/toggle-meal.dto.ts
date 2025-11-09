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

export class ToggleDiaryDto {
  @ApiPropertyOptional({
    description: 'Set meal in diary or not',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isAtDiary?: boolean;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum SetNotificationCategory {
  HYDRATION = 'hydration',
  SLEEP = 'sleep',
  WEIGHT = 'weight',
  MOVEMENT = 'movement',
}

export class SetNotificationsDto {
  @ApiProperty({
    example: 7.5,
    description: 'Updated sleep hours',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  hours?: number;

  @ApiProperty({
    example: 90,
    description: 'Updated sleep value',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({
    example: 'sleep',
    enum: SetNotificationCategory,
    description: 'Category type for the metric (hydration, sleep, weight, or movement)',
  })
  @IsEnum(SetNotificationCategory, {
    message: 'Category must be one of: hydration, sleep, weight, movement',
  })
  category: SetNotificationCategory;
}

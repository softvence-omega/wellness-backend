import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'Health Check' })
  @IsString()
  name: string;

  @ApiProperty({ example: 5, default: 5 })
  @IsInt()
  @Min(1)
  maxPrompts?: number = 5;
}
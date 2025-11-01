import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty({ example: 'room_abc123' })
  @IsString()
  roomId: string;
}
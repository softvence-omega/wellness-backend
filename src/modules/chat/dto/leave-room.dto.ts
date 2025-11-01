import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveRoomDto {
  @ApiProperty({ example: 'room_abc123' })
  @IsString()
  roomId: string;
}
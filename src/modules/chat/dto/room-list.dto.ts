import { ApiProperty } from '@nestjs/swagger';

class RoomDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  aiTitle!: string | null;

  @ApiProperty()
  maxPrompts!: number;

  @ApiProperty()
  promptUsed!: number;

  @ApiProperty({ nullable: true })
  lastActive!: string | null;

  @ApiProperty({ nullable: true })
  capacity!: number | null;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  chatCount!: number;
}

export class RoomListItemDto {
  @ApiProperty()
  membershipId!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  joinedAt!: string;

  @ApiProperty({ type: RoomDto })
  room!: RoomDto;
}

export class RoomListResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: [RoomListItemDto] })
  data!: RoomListItemDto[];
}
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

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
  
  @ApiProperty()
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ListRoomsQueryDto {
  @ApiProperty({ description: 'Page number (1-based)', default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

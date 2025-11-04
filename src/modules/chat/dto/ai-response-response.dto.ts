// src/chat/dto/ai-response-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ChatItemDto {
  @ApiProperty({ description: 'Auto-generated chat ID' })
  id!: string;

  @ApiProperty({ description: 'AI message content' })
  content!: string;

  @ApiProperty({ description: 'Structured response data' })
  responseData!: string;
}

class DataDto {
  @ApiProperty({ example: 'cmhg261840001fsoiuvohmi0s' })
  roomId!: string;

  @ApiProperty({ example: 10 })
  maxPrompt!: number;

  @ApiProperty({ example: 3 })
  promptUsed!: number;

  @ApiProperty({ type: [ChatItemDto] })
  chat!: ChatItemDto[];
}

export class AiResponseResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: DataDto })
  data!: DataDto;
}
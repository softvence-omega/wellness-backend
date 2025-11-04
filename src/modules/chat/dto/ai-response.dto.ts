// src/chat/dto/save-ai-response.dto.ts
import { IsInt, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ChatItemDto {
  @IsString() content!: string;
  @IsString() responseData!: string;
  // NO id here → mobile doesn't send it
}

export class SaveAiResponseDto {
  @IsInt() maxPrompt!: number;
  @IsInt() promptUsed!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatItemDto)
  chat!: ChatItemDto[];
}
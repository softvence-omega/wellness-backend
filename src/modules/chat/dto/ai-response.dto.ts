import { IsInt, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// EXPORT the inner class
export class ChatItemDto {
  @ApiProperty({ description: 'AI message content' })
  @IsString()
  content!: string;

  @ApiProperty({ description: 'Structured response data' })
  @IsString()
  responseData!: string;
}

export class SaveAiResponseDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  maxPrompt!: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  promptUsed!: number;

  @ApiProperty({ type: [ChatItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatItemDto)  // ← Now works!
  chat!: ChatItemDto[];

  @ApiProperty({ description: 'Optional AI-generated title for the room', example: 'Blood Report Summary' })
  @IsOptional()
  @IsString()
  aiTitle?: string;
}


// // src/chat/dto/save-ai-response.dto.ts
// import { IsInt, IsArray, ValidateNested, IsString } from 'class-validator';
// import { Type } from 'class-transformer';

// class ChatItemDto {
//   @IsString() content!: string;
//   @IsString() responseData!: string;
//   // NO id here → mobile doesn't send it
// }

// export class SaveAiResponseDto {
//   @IsInt() maxPrompt!: number;
//   @IsInt() promptUsed!: number;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => ChatItemDto)
//   chat!: ChatItemDto[];
// }


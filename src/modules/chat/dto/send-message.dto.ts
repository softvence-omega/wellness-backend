import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'What is my RBC?' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'User ID for AI context (optional)',
    example: 'test-user-123',
    required: false
  })
  @IsOptional()
  @IsString()
  userId?: string;

}


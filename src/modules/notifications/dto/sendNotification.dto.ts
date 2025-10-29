// src/notification/dto/send-notification.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  id: string;

  @ApiProperty({
    description: 'FCM token of the recipient device',
    example: 'dLzL_w3vQ8KcQ1SaKJWnhr:APA91bGLT...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Message',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification body/message',
    example: 'You have received a new message.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsUUID('4', { message: 'please provided evend id if needed' })
  eventid?: string;

  @ApiPropertyOptional({
    description: 'Additional data to send with the notification',
    example: {
      chatId: 'abc123',
      type: 'message',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}

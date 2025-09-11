import { MessageType } from '@prisma/client';

export class CreateChatDto {
  conversationId: number;
  type: MessageType;
  content?: string;
}

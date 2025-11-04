
export interface UserMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'AI_RESPONSE';
  createdAt: Date;
  senderId: string;
  conversationId: string;
  roomId?: string | null;
}

export interface SendMessageSuccess {
  userMessage: UserMessage;
  aiMessage: UserMessage;
  roomId: string;
}

export interface SendMessageExpired {
  expired: true;
  message: string;
}

export type ChatResult = SendMessageSuccess | SendMessageExpired;
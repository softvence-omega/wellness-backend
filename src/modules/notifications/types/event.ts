import { NotificationEvent } from './notification';

export const EVENT_TYPES = {
  NOTIFICATION_SEND: 'NOTIFICATION_SEND',
  BULK_NOTIFICATION_SEND: 'BULK_NOTIFICATION_SEND',
  CONVERSATION_CREATE: 'CONVERSATION_CREATE',
  PASSWORD_RESET_EMAIL_SEND: 'PASSWORD_RESET_EMAIL_SEND',
} as const;

export interface ConversationCreateEvent {
  memberOneId: string;
  memberTwoId: string;
}

export interface PasswordResetEmailEvent {
  to: string;
  code: string;
  subject?: string;
  expiresInMinutes?: number;
  templateId?: string;
  metadata?: {
    username?: string;
    applicationName?: string;
    resetUrl?: string;
    [key: string]: any;
  };
}

export interface EventPayloadMap {
  [EVENT_TYPES.NOTIFICATION_SEND]: Partial<NotificationEvent>;
  [EVENT_TYPES.BULK_NOTIFICATION_SEND]: Partial<NotificationEvent>[];
  [EVENT_TYPES.CONVERSATION_CREATE]: ConversationCreateEvent;
  [EVENT_TYPES.PASSWORD_RESET_EMAIL_SEND]: PasswordResetEmailEvent;
}

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

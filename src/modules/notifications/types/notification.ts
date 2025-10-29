export interface NotificationJobPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationEvent extends NotificationJobPayload {
  fcmToken: string;
}

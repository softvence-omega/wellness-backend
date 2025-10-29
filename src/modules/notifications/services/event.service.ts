import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { SendNotificationDto } from '../dto/sendNotification.dto';
import { EventTypeService } from '../event/event.service';
import { NotificationEvent } from '../types/notification';
import { EVENT_TYPES } from '../types/event';

@Injectable()
export class EventService {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    private readonly eventEmitter: EventTypeService,
  ) {}

  @OnEvent(EVENT_TYPES.NOTIFICATION_SEND)
  async sendNotification(rawData: SendNotificationDto) {
    await this.eventEmitter.emit('NOTIFICATION_SEND', {
      fcmToken: rawData.token,
      title: rawData.title,
      body: rawData.body,
      data: rawData.data,
      userId: rawData.id,
    });
    await this.notificationQueue.add('notification', rawData);
  }

  @OnEvent(EVENT_TYPES.BULK_NOTIFICATION_SEND)
  async sendBulkNotification(rawData: NotificationEvent[]) {
    await Promise.all(
      rawData.map((data) => this.notificationQueue.add('notification', data)),
    );
  }
}

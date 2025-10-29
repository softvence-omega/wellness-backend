import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { SendNotificationDto } from '../dto/sendNotification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from '../types/apiResponse';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendPushNotification({
    token,
    title,
    body,
    data,
    eventid,
    id,
  }: SendNotificationDto): Promise<ApiResponse<Notification>> {
    try {
      if (!token || !title || !body || !id) {
        throw new BadRequestException(
          'Token, title, body, and user ID are required.',
        );
      }

      const message = {
        token,
        notification: { title, body },
        data: {
          ...(data || {}),
          ...(eventid ? { eventid } : {}),
        },
      };

      let response: string;
      try {
        response = await this.firebaseService.getMessaging().send(message);
        this.logger.debug(`Push notification sent successfully: ${response}`);
      } catch (firebaseError) {
        this.logger.error('Firebase notification sending failed', {
          firebaseError,
        });
        throw new BadRequestException(
          'Failed to send notification to Firebase.',
        );
      }

      const notification = await this.prisma.notification.create({
        data: {
          title,
          body: {
            message: body,
            extra: data || {},
          },
          userId: id,
          eventId: eventid || null,
        },
      });

      this.logger.log(
        `Notification saved successfully for user ${id}: ${notification.id}`,
      );

      return {
        data: notification,
        message: 'Notification sent and saved successfully.',
        success: true,
      };
    } catch (error) {
      this.logger.error('Error sending or saving push notification', { error });

      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Prisma error: ${error.code}`, { meta: error.meta });
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to send or save push notification.',
      );
    }
  }

  /**
   * Fetch notifications for a specific user
   */
  async getNotification({
    id,
  }: {
    id: string;
  }): Promise<ApiResponse<Notification[]>> {
    try {
      if (!id) throw new BadRequestException('User ID is required');

      const notifications = await this.prisma.notification.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(
        `Fetched ${notifications.length} notifications for user ${id}`,
      );

      return {
        data: notifications,
        message: 'Notifications fetched successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error('Error fetching notifications', { error });

      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch notifications.');
    }
  }
}

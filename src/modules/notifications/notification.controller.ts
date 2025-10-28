import { BadRequestException, Body, Controller, Post, Query, Req, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SendNotificationDto } from './dto/sendNotification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';



@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    
) {}
  @Post('send')
  async sendNotification(@Body() data: SendNotificationDto) {
  await this.notificationService.sendPushNotification(data);
  
   return { success: true, message: 'Notification sent successfully' };
  }

@Post('get')
@ApiBearerAuth()
async getNotification(@Request() req,) {
   if (!req.user) {
      throw new BadRequestException(
        'User not authenticated - req.user is undefined',
      );
    }

    if (!req.user.userId) {
      throw new BadRequestException(
        `User ID is required. User object: ${JSON.stringify(req.user)}`,
      );
    }

  return this.notificationService.getNotification({ id:req.user.userId });
}
}
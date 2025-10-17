// import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
// import { NotificationsService } from './notifications.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/role-auth.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { successResponse } from 'src/common/response';
// import { NotificationDto } from './dto/notification.dto';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('notifications')
// export class NotificationsController {
//   constructor(private notificationsService: NotificationsService) {}

//   // ✅ Get logged-in user's notification settings
//   @Get('me')
//   @Roles('ADMIN', 'USER')
//   async getMyNotifications(@Req() req) {
//     const userId = req.user.userId;
//     const data = await this.notificationsService.getByUser(userId);
//     return successResponse(data, 'Notification settings fetched');
//   }

//   // ✅ Create/initialize notification settings
//   @Post('me/init')
//   @Roles('ADMIN', 'USER')
//   async initNotifications(@Req() req, @Body() dto: NotificationDto) {
//     const userId = req.user.userId;
//     const data = await this.notificationsService.createOrInit(userId, dto);
//     return successResponse(data, 'Notification settings initialized');
//   }

//   // ✅ Update notification settings
//   @Put('me/update')
//   @Roles('ADMIN', 'USER')
//   async updateNotifications(@Req() req, @Body() dto: NotificationDto) {
//     const userId = req.user.userId;
//     const data = await this.notificationsService.update(userId, dto);
//     return successResponse(data, 'Notification settings updated');
//   }
// }

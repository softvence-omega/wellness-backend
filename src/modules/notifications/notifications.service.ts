import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }    

    // ✅ Create or initialize notification settings for user
    async createOrInit(userId: number, dto: NotificationDto) {
        const existing = await this.prisma.notification.findUnique({ where: { userId } });
        if (existing) return existing;
        // if (existing) throw new NotFoundException('Notification settings Already exist');


        const notification = await this.prisma.notification.create({
            data: {
                userId,
                ...dto,
            },
        });
        return notification;
    }

    // ✅ Get notification settings
    async getByUser(userId: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { userId },
        });
        if (!notification) throw new NotFoundException('Notification settings not found');
        return notification;
    }

    // ✅ Update notification settings
    async update(userId: number, dto: NotificationDto) {
        const existing = await this.prisma.notification.findUnique({ where: { userId } });
        if (!existing) throw new NotFoundException('Notification settings not found');

        const updated = await this.prisma.notification.update({
            where: { userId },
            data: { ...dto },
        });
        return updated;
    }
}

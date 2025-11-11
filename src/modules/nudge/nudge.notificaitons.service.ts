import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { addHours, isBefore } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationCategory } from 'src/common/enums/notification-category.enum';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
) {}

  
  @Cron('*/1 * * * *') 
  async handleHourlyTask() {
    this.logger.log('⏰ Hourly cron job executed!');

    const now = new Date();


   await SleepContinious(now)
   
   await WeightContinious(now)

   await MovementContinious(now)
   
   await HydrationContinious(now)

    this.logger.log(`✅ Updated record(s) successfully.`);
  }
}



async function SleepContinious(now) {

    //sleep

    const Srecords = await this.prisma.sleep.findMany({
      where: {
        date: { lte: now },
        count: { lt: 24 },
      },
    });

    if (Srecords.length === 0) {
      this.logger.log('No Srecords need updating.');
      return;
    }

    for (const record of Srecords) {
      const newDate = addHours(record.date, 1);
      const newCount = record.count + 1;


      
      const user = await this.prisma.user.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }

      
      await this.notificationService.sendPushNotification({
        token: user.fcmtoken,
        title: 'Sleep Reminder 😴',
        body: 'It’s time to rest and recharge! Make sure you’re getting enough sleep tonight.',
        id: user.id,
        category: NotificationCategory.WELLNESS_NUDGES,
      });


 
    

      await this.prisma.sleep.update({
        where: { id: record.id },
        data: {
          date: newDate,
          count: newCount,
        },
      });

      this.logger.log(
        `🔁 Updated record ${record.id}: nextUpdateAt -> ${newDate.toISOString()}, count -> ${newCount}`,
      );
    }

}

async function WeightContinious(now) {
        //weight

    const Wrecords = await this.prisma.weight.findMany({
      where: {
        date: { lte: now },
        count: { lt: 24 },
      },
    });

    if (Wrecords.length === 0) {
      this.logger.log('No Wrecords need updating.');
      return;
    }

    for (const record of Wrecords) {
      const newDate = addHours(record.date, 1);
      const newCount = record.count + 1;


      
      const user = await this.prisma.user.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }

      
      await this.notificationService.sendPushNotification({
        token: user.fcmtoken,
       title: 'Weight Check Reminder ⚖️',
       body: 'It’s time to check your weight and stay on track with your wellness goals!',
        id: user.id,
        category: NotificationCategory.WELLNESS_NUDGES,
      });


 
    

      await this.prisma.weight.update({
        where: { id: record.id },
        data: {
          date: newDate,
          count: newCount,
        },
      });

      this.logger.log(
        `🔁 Updated record ${record.id}: nextUpdateAt -> ${newDate.toISOString()}, count -> ${newCount}`,
      );
    }

}


async function MovementContinious(now) {
        //movement

    const Mrecords = await this.prisma.movement.findMany({
      where: {
        date: { lte: now },
        count: { lt: 24 },
      },
    });

    if (Mrecords.length === 0) {
      this.logger.log('No Mrecords need updating.');
      return;
    }

    for (const record of Mrecords) {
      const newDate = addHours(record.date, 1);
      const newCount = record.count + 1;


      
      const user = await this.prisma.user.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }

      
      await this.notificationService.sendPushNotification({
        token: user.fcmtoken,
        title: 'Movement Reminder 🏃‍♂️',
         body: 'Time to stretch or take a short walk! Keep your body active and energized.',
        id: user.id,
        category: NotificationCategory.WELLNESS_NUDGES,
      });


 
    

      await this.prisma.movement.update({
        where: { id: record.id },
        data: {
          date: newDate,
          count: newCount,
        },
      });

      this.logger.log(
        `🔁 Updated record ${record.id}: nextUpdateAt -> ${newDate.toISOString()}, count -> ${newCount}`,
      );
    }


}


async function  HydrationContinious(now) {
    //hydratins
    const records = await this.prisma.hydration.findMany({
      where: {
        date: { lte: now },
        count: { lt: 24 },
      },
    });

    if (records.length === 0) {
      this.logger.log('No records need updating.');
      return;
    }

    for (const record of records) {
      const newDate = addHours(record.date, 1);
      const newCount = record.count + 1;


      
      const user = await this.prisma.user.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }

      
      await this.notificationService.sendPushNotification({
        token: user.fcmtoken,
        title: 'Hydration Reminder 💧',
        body: 'Time to drink water and stay hydrated!',
        id: user.id,
        category: NotificationCategory.WELLNESS_NUDGES,
      });


 
    

      await this.prisma.hydration.update({
        where: { id: record.id },
        data: {
          date: newDate,
          count: newCount,
        },
      });

      this.logger.log(
        `🔁 Updated record ${record.id}: nextUpdateAt -> ${newDate.toISOString()}, count -> ${newCount}`,
      );
    }
}





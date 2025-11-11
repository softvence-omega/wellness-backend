import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { addHours, isBefore } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationCategory } from 'src/common/enums/notification-category.enum';
import { NudgeCategory } from '@prisma/client';

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


      
      const user = await this.prisma.User.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }



const lastSleepNudge = await this.prisma.nudge.findFirst({
  where: {
    userId: user.id,
    category: NudgeCategory.SLEEP,
    isDeleted: false,
  },
  orderBy: {
    createdAt: 'desc',
  },
  include: {
    tips: true,
  },
});

if (!lastSleepNudge) {
  this.logger.warn(`No sleep record found for user ${user.id}`);
  return;
}

// 💤 Example rule for sleep — if value >= target (like sleep goal reached)
if (lastSleepNudge.value >= lastSleepNudge.targetAmount) {
  await this.prisma.sleep.update({
    where: { id: record.id },
    data: {
      date: newDate,
      count: 24,
    },
  });

  this.logger.log(
    `User ${user.id} already reached sleep goal (${lastSleepNudge.value}/${lastSleepNudge.targetAmount}). Skipping notification.`
  );
  return;
}


        await this.notificationService.sendPushNotification({
          token: user.fcmtoken,
          title: 'Sleep Reminder 😴',
          body: `It’s time to rest and recharge! (${lastSleepNudge.value} / ${lastSleepNudge.targetAmount} hrs)`,
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


      
      const user = await this.prisma.User.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }



      const lastWeightNudge = await this.prisma.nudge.findFirst({
                where: {
                  userId: user.id,
                  category: NudgeCategory.WEIGHT,
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                include: {
                  tips: true,
                },
              });

              if (!lastWeightNudge) {
                this.logger.warn(`No weight record found for user ${user.id}`);
                return;
              }

              // ⚖️ Example rule — if goal achieved (like weight reached target)
              if (lastWeightNudge.value === lastWeightNudge.targetAmount) {
                await this.prisma.weight.update({
                  where: { id: record.id },
                  data: {
                    date: newDate,
                    count: 24,
                  },
                });

                this.logger.log(
                  `User ${user.id} already reached weight goal (${lastWeightNudge.value}/${lastWeightNudge.targetAmount}). Skipping notification.`
                );
                return;
              }

      
                await this.notificationService.sendPushNotification({
                  token: user.fcmtoken,
                  title: 'Weight Check Reminder ⚖️',
                  body: `Check your weight progress! (${lastWeightNudge.value} / ${lastWeightNudge.targetAmount} kg)`,
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


      
      const user = await this.prisma.User.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }


      const lastMovementNudge = await this.prisma.nudge.findFirst({
  where: {
    userId: user.id,
    category: NudgeCategory.MOVEMENT,
    isDeleted: false,
  },
  orderBy: {
    createdAt: 'desc',
  },
  include: {
    tips: true,
  },
});

if (!lastMovementNudge) {
  this.logger.warn(`No movement record found for user ${user.id}`);
  return;
}

// 🏃 Example rule — if movement goal reached
if (lastMovementNudge.value >= lastMovementNudge.targetAmount) {
  await this.prisma.movement.update({
    where: { id: record.id },
    data: {
      date: newDate,
      count: 24,
    },
  });

  this.logger.log(
    `User ${user.id} already met movement goal (${lastMovementNudge.value}/${lastMovementNudge.targetAmount}). Skipping notification.`
  );
  return;
}




        await this.notificationService.sendPushNotification({
          token: user.fcmtoken,
          title: 'Movement Reminder 🏃‍♂️',
          body: `Time to move! (${lastMovementNudge.value} / ${lastMovementNudge.targetAmount} steps)`,
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


      
      const user = await this.prisma.User.findUnique({
        where: { id: record.userId },
      });

      if (!user || !user.fcmtoken) {
        this.logger.warn(`User ${record.userId} has no FCM token.`);
        continue;
      }



           const lastHydrationNudge = await this.prisma.nudge.findFirst({
              where: {
                userId: user.id,
                category: 'HYDRATION',
                isDeleted: false,
              },
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                tips: true,
              },
            });

            
            if (!lastHydrationNudge) {
              this.logger.warn(`No hydration record found for user ${user.id}`);
              return;
            }

           
            if (lastHydrationNudge.consumedAmount >= lastHydrationNudge.targetAmount) {
               

                await this.prisma.hydration.update({
                  where: { id: record.id },
                  data: {
                    date: newDate,
                    count: 24,
                  },
                });

              this.logger.log(
                `User ${user.id} already met hydration goal (${lastHydrationNudge.consumedAmount}/${lastHydrationNudge.targetAmount}). Skipping notification.`
              );
              return;
            }

      
            await this.notificationService.sendPushNotification({
          token: user.fcmtoken,
          title: 'Hydration Reminder 💧',
          body: `Time to drink water and stay hydrated! (${lastHydrationNudge.consumedAmount} / ${lastHydrationNudge.targetAmount} ml)`,
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





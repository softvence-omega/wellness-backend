import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlanName } from '@prisma/client';

export type UsageType = 'prompts' | 'medicalReports' | 'mealScans';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}


  private async getPlanOrFail(name: PlanName) {
    const plan = await this.prisma.plan.findUnique({
      where: { name },
    });

    if (!plan) {
      throw new NotFoundException(`Plan "${name}" not found`);
    }
    return plan;
  }

// In subscriptions.service.ts
async getMySubscription(userId: string) {
  console.log('🔄 Getting subscription for user:', userId);
  
  try {
    let sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    console.log('📋 Found subscription:', sub);

    if (!sub) {
      console.log('📝 No subscription found, creating FREE plan...');
      
      // First, let's check if FREE plan exists
      const freePlan = await this.prisma.plan.findUnique({
        where: { name: 'FREE' },
      });
      
      console.log('🔍 FREE plan lookup result:', freePlan);
      
      if (!freePlan) {
        throw new NotFoundException('FREE plan not found in database');
      }

      sub = await this.prisma.userSubscription.create({
        data: {
          userId,
          planId: freePlan.id,
          status: 'FREE',
          usage: { 
            promptsUsed: 0, 
            medicalReportsUsed: 0, 
            mealScansUsed: 0 
          },
        },
        include: { plan: true },
      });
      
      console.log('✅ Created new subscription:', sub);
    }
    
    return sub;
  } catch (error) {
    console.error('❌ Error in getMySubscription:', error);
    throw error;
  }
}
  async incrementUsage(userId: string, type: UsageType) {
    const sub = await this.getMySubscription(userId);
    const usage = sub.usage as any;
    const key = `${type}Used` as const;
    const maxKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}` as const;
    const max = sub.plan[maxKey] as number;

    if (usage[key] >= max) {
      throw new InternalServerErrorException(
        `Limit exceeded for ${type}. Upgrade to Pro!`,
      );
    }
    usage[key] += 1;

    await this.prisma.userSubscription.update({
      where: { userId },
      data: { usage },
    });
  }

  async upgradeToPro(userId: string) {
    const pro = await this.getPlanOrFail('PRO');

    await this.prisma.userSubscription.upsert({
      where: { userId },
      update: {
        planId: pro.id,
        status: 'ACTIVE',
        usage: { promptsUsed: 0, medicalReportsUsed: 0, mealScansUsed: 0 },
      },
      create: {
        userId,
        planId: pro.id,
        status: 'ACTIVE',
        usage: { promptsUsed: 0, medicalReportsUsed: 0, mealScansUsed: 0 },
      },
    });
  }
}
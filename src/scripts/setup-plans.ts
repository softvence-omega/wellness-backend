// scripts/setup-plans.ts
import { PrismaClient, PlanName } from '@prisma/client';

const prisma = new PrismaClient();

async function setupPlans() {
  try {
    console.log('🔄 Setting up plans...');

    const plans = [
      {
        name: PlanName.FREE, 
        displayName: 'Free Plan',
        priceCents: 0,
        currency: 'usd',
        maxPrompts: 2,
        maxMedicalReports: 1,
        maxMealScans: 2,
        description: 'Basic free plan with limited features',
        isActive: true,
      },
      {
        name: PlanName.PRO, 
        displayName: 'Pro Plan',
        priceCents: 1900,
        currency: 'usd',
        maxPrompts: 15,
        maxMedicalReports: 8,
        maxMealScans: 12,
        description: 'Premium plan with unlimited access',
        isActive: true,
      },
    ];

    for (const planData of plans) {
      const plan = await prisma.plan.upsert({
        where: { name: planData.name },
        update: planData,
        create: planData,
      });
      console.log(`✅ ${plan.displayName} plan ready`);
    }

    console.log(' All plans setup completed!');
  } catch (error) {
    console.error(' Error setting up plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPlans();
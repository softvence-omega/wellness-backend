import { PrismaClient, PlanName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed: Creating plans...');

  // Free Plan
  await prisma.plan.upsert({
    where: { name: PlanName.FREE },
    update: {},
    create: {
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
  });

  // Pro Plan
  await prisma.plan.upsert({
    where: { name: PlanName.PRO },
    update: {},
    create: {
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
  });

  console.log('✅ Seed completed: Plans created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
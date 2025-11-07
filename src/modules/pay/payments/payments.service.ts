import { Injectable, NotFoundException } from '@nestjs/common';

import { Stripe } from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: '2024-06-20',
    });
  }

  async createPaymentIntent(
  userId: string,
  dto: CreatePaymentIntentDto,
) {
  console.log('🔍 Plan name received:', dto.planName);

  // Method 1: Find first active plan with the name
  const plan = await this.prisma.plan.findFirst({
    where: { 
      name: dto.planName as any, // Force type if needed
      isActive: true 
    },
  });

  // Method 2: If still not working, try without isActive filter
  if (!plan) {
    console.log('🔄 Trying without isActive filter...');
    const planWithoutActive = await this.prisma.plan.findUnique({
      where: { name: dto.planName as any },
    });
    console.log('Plan without active filter:', planWithoutActive);
  }

  if (!plan) {
    // List all available plans for debugging
    const allPlans = await this.prisma.plan.findMany();
    console.log('📋 All available plans:', allPlans);
    throw new NotFoundException(`Plan "${dto.planName}" not found. Available plans: ${allPlans.map(p => p.name).join(', ')}`);
  }

  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: plan.priceCents,
    currency: 'usd',
    metadata: { userId, planName: plan.name },
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: paymentIntent.client_secret! };
}
}
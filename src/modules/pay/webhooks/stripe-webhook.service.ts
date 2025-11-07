import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(private subsService: SubscriptionsService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: '2024-06-20',
    });
  }

  async handle(payload: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === 'payment_intent.succeeded') {
      const { userId } = event.data.object.metadata;
      await this.subsService.upgradeToPro(userId);
    }

    return { received: true };
  }
}
import { Controller, Post, Req, RawBody, Header, HttpCode } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private webhookService: StripeWebhookService) {}

  @Post()
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  async handle(@Req() req: any) {
    return this.webhookService.handle(req.rawBody, req.headers['stripe-signature']);
  }
  
}
import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionsController } from './subscriptions.controller';


@Module({
    controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PrismaService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
import { Module } from '@nestjs/common';
import { ChatModule } from './modules/chat/chat.module';
import { ConversationsController } from './modules/conversations/conversations.controller';
import { ConversationsService } from './modules/conversations/conversations.service';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { DeviceIntegrationModule } from './modules/device-integration/device-integration.module';
import { LabReportsModule } from './modules/lab-reports/lab-reports.module';
import { MealsModule } from './modules/meals/meals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfileModule } from './modules/profile/profile.module';

import { TipsModule } from './modules/tips/tips.module';
import { UsersModule } from './modules/users/users.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { AuthModule } from './modules/auth/auth.module';
import { GoogleService } from './modules/google/google.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true, // 👈 makes ConfigService available everywhere
    }), ChatModule, AuthModule, ConversationsModule, DeviceIntegrationModule, LabReportsModule, MealsModule, NotificationsModule, ProfileModule, TipsModule, UsersModule, VitalsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, GoogleService],
})
export class AppModule { }

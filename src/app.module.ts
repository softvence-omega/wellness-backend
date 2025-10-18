import { Module } from '@nestjs/common';
// import { ChatModule } from './modules/chat/chat.module';

import { DeviceIntegrationModule } from './modules/device-integration/device-integration.module';
import { LabReportsModule } from './modules/lab-reports/lab-reports.module';
// import { MealsModule } from './modules/meals/meals.module';
// import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfileModule } from './modules/profile/profile.module';

import { TipsModule } from './modules/tips/tips.module';
// import { UsersModule } from './modules/users/users.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { AuthModule } from './modules/auth/auth.module';
import { GoogleService } from './modules/google/google.service';
import { ConfigModule } from '@nestjs/config';
import { MealsModule } from './modules/meals/meals.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
// import { FitbitModule } from './modules/fitbit/fitbit.module';
// import { NudgeModule } from './modules/nudge/nudge.module';
// import { StravaModule } from './modules/strava/strava.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
  }), AuthModule, DeviceIntegrationModule, LabReportsModule, ProfileModule,MealsModule, TipsModule, VitalsModule,CloudinaryModule ],
  controllers: [],
  providers: [GoogleService],
})
export class AppModule { }

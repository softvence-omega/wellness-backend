import { Module } from '@nestjs/common';
// import { ChatModule } from './modules/chat/chat.module';

import { DeviceIntegrationModule } from './modules/device-integration/device-integration.module';
import { ProfileModule } from './modules/profile/profile.module';

import { TipsModule } from './modules/tips/tips.module';
// import { UsersModule } from './modules/users/users.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { AuthModule } from './modules/auth/auth.module';
import { GoogleService } from './modules/google/google.service';
import { ConfigModule } from '@nestjs/config';
import { MealsModule } from './modules/meals/meals.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmotionsModule } from './modules/emotion/emotions.module';
import { HealthDataModule } from './modules/watch-data/watch-data.module';
import { MedicalLabReportsModule } from './modules/lab-reports/lab-reports.module';
// import { FitbitModule } from './modules/fitbit/fitbit.module';
// import { NudgeModule } from './modules/nudge/nudge.module';
// import { StravaModule } from './modules/strava/strava.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
  }), AuthModule, DeviceIntegrationModule, ProfileModule,MealsModule, TipsModule, VitalsModule,CloudinaryModule, EmotionsModule, HealthDataModule,MedicalLabReportsModule  ],
  controllers: [],
  providers: [GoogleService],
})
export class AppModule { }

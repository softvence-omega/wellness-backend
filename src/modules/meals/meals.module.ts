import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MealController } from './meals.controller';
import { MealService } from './meals.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomLogger } from 'src/logger/logger.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    // Import JwtModule if your MealService needs it, otherwise remove
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    CloudinaryModule,
    ConfigModule, // Import ConfigModule if needed
  ],
  controllers: [MealController],
  providers: [
    MealService,
    PrismaService,
    CustomLogger,
    // Remove AuthService and MailService unless they are actually used in MealService
  ],
  exports: [MealService],
})
export class MealsModule {}

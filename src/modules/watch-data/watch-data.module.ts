// src/health-data/health-data.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthDataController } from './watch-data.controller';
import { HealthDataService } from './watch-data.service';



@Module({
  imports: [PrismaModule],
  controllers: [HealthDataController],
  providers: [HealthDataService],
  exports: [HealthDataService],
})
export class HealthDataModule {}
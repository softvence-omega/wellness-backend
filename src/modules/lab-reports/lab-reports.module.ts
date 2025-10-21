// src/lab-reports/lab-reports.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MedicalReportsController } from './lab-reports.controller';
import { MedicalReportsService } from './lab-reports.service';
import { MedicalReportsRepository } from './medical-reports.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService, MedicalReportsRepository],
  exports: [MedicalReportsService],
})
export class MedicalLabReportsModule {}
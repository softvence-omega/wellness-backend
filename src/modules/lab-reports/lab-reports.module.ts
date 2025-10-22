// src/lab-reports/lab-reports.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MedicalReportsController } from './lab-reports.controller';
import { MedicalReportsService } from './lab-reports.service';
import { MedicalReportsRepository } from './medical-reports.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService, MedicalReportsRepository],
  exports: [MedicalReportsService],
})
export class MedicalLabReportsModule {}
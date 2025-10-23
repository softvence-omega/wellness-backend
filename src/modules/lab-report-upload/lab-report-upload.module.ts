// src/emotions/emotions.module.ts
import { Module } from '@nestjs/common';
import { CustomLogger } from 'src/logger/logger.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LabReportController } from './lab-report-upload.controller';
import { LabReportService } from './lab-report-upload.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';


@Module({
  imports: [PrismaModule, CloudinaryModule], 
  controllers: [LabReportController], 
  providers: [LabReportService, CustomLogger], 
  exports: [LabReportService],
})
export class LabReportFileUploadModule {}
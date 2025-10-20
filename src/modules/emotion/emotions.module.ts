// src/emotions/emotions.module.ts
import { Module } from '@nestjs/common';
import { EmotionsService } from './emotions.service';
import { EmotionsController } from './emotions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomLogger } from 'src/logger/logger.service';


@Module({
  imports: [PrismaModule], 
  controllers: [EmotionsController], 
  providers: [EmotionsService, CustomLogger], 
  exports: [EmotionsService],
})
export class EmotionsModule {}
import { Module } from '@nestjs/common';
import { NudgesService } from './nudge.service';
import { NudgesController } from './nudge.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustomLogger } from 'src/logger/logger.service';

@Module({
  imports: [PrismaModule],
  providers: [NudgesService],
  controllers: [NudgesController],
  exports: [NudgesService],
})
export class NudgeModule {}

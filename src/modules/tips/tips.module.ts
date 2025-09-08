import { Module } from '@nestjs/common';
import { TipsService } from './tips.service';
import { TipsController } from './tips.controller';

@Module({
  providers: [TipsService],
  controllers: [TipsController]
})
export class TipsModule {}

import { Module } from '@nestjs/common';
import { FitbitController } from './fitbit.controller';
import { FitbitService } from './fitbit.service';

@Module({
  controllers: [FitbitController],
  providers: [FitbitService]
})
export class FitbitModule {}

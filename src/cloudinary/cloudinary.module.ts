import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CustomLogger } from 'src/logger/logger.service';

@Module({
  providers: [CloudinaryService, CustomLogger],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
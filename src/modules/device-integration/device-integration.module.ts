import { Module } from '@nestjs/common';
import { DeviceIntegrationService } from './device-integration.service';
import { DeviceIntegrationController } from './device-integration.controller';

@Module({
  providers: [DeviceIntegrationService],
  controllers: [DeviceIntegrationController]
})
export class DeviceIntegrationModule {}

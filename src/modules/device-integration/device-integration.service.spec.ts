import { Test, TestingModule } from '@nestjs/testing';
import { DeviceIntegrationService } from './device-integration.service';

describe('DeviceIntegrationService', () => {
  let service: DeviceIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceIntegrationService],
    }).compile();

    service = module.get<DeviceIntegrationService>(DeviceIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

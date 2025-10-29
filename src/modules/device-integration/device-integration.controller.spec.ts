import { Test, TestingModule } from '@nestjs/testing';
import { DeviceIntegrationController } from './device-integration.controller';

describe('DeviceIntegrationController', () => {
  let controller: DeviceIntegrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceIntegrationController],
    }).compile();

    controller = module.get<DeviceIntegrationController>(
      DeviceIntegrationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

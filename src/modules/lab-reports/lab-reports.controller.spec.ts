import { Test, TestingModule } from '@nestjs/testing';
import { LabReportsController } from './lab-reports.controller';

describe('LabReportsController', () => {
  let controller: LabReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabReportsController],
    }).compile();

    controller = module.get<LabReportsController>(LabReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

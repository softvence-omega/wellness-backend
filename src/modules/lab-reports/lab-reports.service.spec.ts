import { Test, TestingModule } from '@nestjs/testing';
import { LabReportsService } from './lab-reports.service';

describe('LabReportsService', () => {
  let service: LabReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabReportsService],
    }).compile();

    service = module.get<LabReportsService>(LabReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

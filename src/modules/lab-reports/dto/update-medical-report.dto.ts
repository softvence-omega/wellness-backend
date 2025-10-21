import { PartialType } from '@nestjs/swagger';
import { CreateMedicalReportDto } from './create-medical-report.dto';

export class UpdateMedicalReportDto extends PartialType(CreateMedicalReportDto) {}
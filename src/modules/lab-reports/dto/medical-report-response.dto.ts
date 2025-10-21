import { ApiProperty } from '@nestjs/swagger';
import { ReportType } from '@prisma/client';

export class LabValueResponseDto {
  @ApiProperty()
  test_name: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  ref_ranges: string;

  @ApiProperty({ enum: ['within', 'below', 'above', 'borderline'] })
  status: 'within' | 'below' | 'above' | 'borderline';
}

export class ReportDataResponseDto {
  @ApiProperty()
  patient_name: string;

  @ApiProperty()
  report_date: string;

  @ApiProperty({ type: [LabValueResponseDto] })
  lab_values: LabValueResponseDto[];

  @ApiProperty({ required: false })
  wellness_insight?: string;
}

export class MedicalReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty({ enum: ReportType })
  reportType: ReportType;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  reportDate: Date;

  @ApiProperty({ required: false })
  labName?: string;

  @ApiProperty({ required: false })
  doctorName?: string;

  @ApiProperty({ type: ReportDataResponseDto })
  reportData: ReportDataResponseDto;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedMedicalReportsResponseDto {
  @ApiProperty({ type: [MedicalReportResponseDto] })
  reports: MedicalReportResponseDto[];

  @ApiProperty()
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsObject,
  IsUrl,
  IsArray,
  ValidateNested,
  IsNumber,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType } from '@prisma/client';

export class LabValueDto {
  @ApiProperty({ description: 'Name of the test' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  test_name: string;

  @ApiProperty({ description: 'Test value' })
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Reference ranges' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  ref_ranges: string;

  @ApiProperty({
    description: 'Test status',
    enum: ['within', 'below', 'above', 'borderline'],
  })
  @IsNotEmpty()
  @IsString()
  status: 'within' | 'below' | 'above' | 'borderline';
}

export class ReportDataDto {
  @ApiProperty({ description: 'Patient name from the report' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  patient_name: string;

  @ApiProperty({ description: 'Report date from the report' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  report_date: string;

  @ApiProperty({
    description: 'Array of lab values',
    type: [LabValueDto],
  })
  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LabValueDto)
  lab_values: LabValueDto[];

  @ApiProperty({
    required: false,
    description: 'Wellness insights from the report',
  })
  @IsOptional()
  @IsString()
  wellness_insight?: string;
}

export class CreateLabReportDto {
  @ApiProperty({ description: 'ID of the user uploading the report' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  photo?: string;
  fileUrl?: string;
}
export class CreateMedicalReportDto {
  @ApiProperty({ description: 'Name of the report file' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'URL where the report file is stored' })
  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ enum: ReportType, description: 'Type of medical report' })
  @IsNotEmpty()
  @IsOptional()
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ description: 'Name of the patient' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  patientName: string;

  @ApiProperty({ description: 'Date when the report was generated' })
  @IsNotEmpty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  reportDate: Date;

  @ApiProperty({ required: false, description: 'Name of the laboratory' })
  @IsOptional()
  @IsOptional()
  @IsString()
  labName?: string;

  @ApiProperty({ required: false, description: 'Name of the referring doctor' })
  @IsOptional()
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiProperty({
    description: 'Structured report data with lab values',
    type: ReportDataDto,
  })
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportDataDto)
  reportData: ReportDataDto;
}

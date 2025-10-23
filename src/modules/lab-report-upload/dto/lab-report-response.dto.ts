import { ApiProperty } from '@nestjs/swagger';

export class LabReportResponseDto {
  @ApiProperty({ description: 'Unique identifier for the lab report' })
  id: string;

  @ApiProperty({ description: 'User ID who owns the report' })
  userId: string;

  @ApiProperty({ description: 'Cloudinary URL of the uploaded file' })
  reportFile: string;

  @ApiProperty({ description: 'Upload timestamp' })
  createdAt: Date;

  constructor(partial: Partial<LabReportResponseDto>) {
    Object.assign(this, partial);
  }
}
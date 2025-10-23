import { ApiProperty } from '@nestjs/swagger';

export class UploadLabReportDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Lab report file (PDF, JPG, PNG)' })
  reportFile: any;
}
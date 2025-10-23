import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class BulkDeleteDto {
  @ApiProperty({ 
    type: [String], 
    example: ['report1', 'report2', 'report3'],
    description: 'Array of lab report IDs to delete' 
  })
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}
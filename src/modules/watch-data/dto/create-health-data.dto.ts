// src/health-data/dto/create-health-data.dto.ts
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsObject, 
  IsDate, 
  IsEnum, 
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType, DataQuality } from '@prisma/client';

export class SleepDataDto {
  @IsOptional() @IsNumber() deepMinutes?: number;
  @IsOptional() @IsNumber() lightMinutes?: number;
  @IsOptional() @IsNumber() remMinutes?: number;
  @IsOptional() @IsNumber() awakeMinutes?: number;
  @IsOptional() @IsNumber() coreMinutes?: number;
  @IsOptional() @IsNumber() sleepEfficiency?: number;
  @IsOptional() @IsNumber() timeInBed?: number;
  @IsOptional() @IsNumber() sleepLatency?: number;
  @IsOptional() @IsDate() @Type(() => Date) bedtimeStart?: Date;
  @IsOptional() @IsDate() @Type(() => Date) bedtimeEnd?: Date;
  @IsOptional() @IsNumber() consistency?: number;
}

export class WorkoutDataDto {
  @IsOptional() @IsEnum(WorkoutType) workoutType?: WorkoutType;
  @IsOptional() @IsNumber() duration?: number;
  @IsOptional() @IsNumber() totalDistance?: number;
  @IsOptional() @IsNumber() totalEnergy?: number;
  @IsOptional() @IsNumber() avgHeartRate?: number;
  @IsOptional() @IsNumber() maxHeartRate?: number;
  @IsOptional() @IsNumber() minHeartRate?: number;
  @IsOptional() @IsNumber() elevation?: number;
  @IsOptional() @IsObject() routeData?: any;
}

export class CreateHealthDataDto {
  @IsString() 
  userId: string;
  
  // Core metrics
  @IsOptional() @IsNumber() steps?: number;
  @IsOptional() @IsNumber() heartRate?: number;
  @IsOptional() @IsNumber() activeCalories?: number;
  @IsOptional() @IsNumber() restingHeartRate?: number;
  @IsOptional() @IsNumber() heartRateVariability?: number;
  
  // Nested data
  @IsOptional() @IsObject() sleepData?: SleepDataDto;
  @IsOptional() @IsObject() workoutData?: WorkoutDataDto;
  
  // Apple Watch metadata
  @IsOptional() @IsString() dataSource?: string;
  @IsOptional() @IsString() deviceName?: string;
  @IsOptional() @IsString() syncSessionId?: string;
  
  // Time range (required for Apple Watch data)
  @IsDate() @Type(() => Date) startTime: Date;
  @IsDate() @Type(() => Date) endTime: Date;
  
  // Data quality
  @IsOptional() @IsBoolean() isManualEntry?: boolean;
  @IsOptional() @IsEnum(DataQuality) dataQuality?: DataQuality;
}

export class BatchSyncHealthDataDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHealthDataDto)
  data: CreateHealthDataDto[];
}
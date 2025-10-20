// src/health-data/dto/health-data-response.dto.ts
export class HealthDataSummaryDto {
  totalSteps: number;
  avgHeartRate: number;
  avgRestingHeartRate: number;
  totalActiveCalories: number;
  totalSleepHours: number;
  workoutCount: number;
  dataPoints: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export class HealthDataResponseDto {
  summary: HealthDataSummaryDto | null;
  detailedData: any[];
}

export class SyncStatusResponseDto {
  lastSync: Date | null;
  dataSource: string | null;
  deviceName: string | null;
  syncSessionId: string | null;
  todayDataPoints: number;
  isSyncedRecently: boolean;
}

export class BatchSyncResponseDto {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    success: boolean;
    error?: string;
    data?: any;
  }>;
}
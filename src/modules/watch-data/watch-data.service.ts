// src/health-data/health-data.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateHealthDataDto } from './dto/create-health-data.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DateUtils } from 'src/utils/utils';

export interface BatchSyncResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface BatchSyncResponse {
  total: number;
  successful: number;
  failed: number;
  results: BatchSyncResult[];
}

export interface HealthSummary {
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

export interface HealthDataResponse {
  summary: HealthSummary | null;
  detailedData: any[];
}

export interface SyncStatusResponse {
  lastSync: Date | null;
  dataSource: string | null;
  deviceName: string | null;
  syncSessionId: string | null;
  todayDataPoints: number;
  isSyncedRecently: boolean;
}

@Injectable()
export class HealthDataService {
  constructor(private prisma: PrismaService) {}

  async syncAppleWatchData(createHealthDataDto: CreateHealthDataDto) {
    const {
      userId,
      steps,
      heartRate,
      activeCalories,
      restingHeartRate,
      heartRateVariability,
      sleepData,
      workoutData,
      startTime,
      endTime,
      dataSource = 'com.apple.health',
      deviceName = 'Apple Watch',
      syncSessionId,
    } = createHealthDataDto;

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate time range
    if (!startTime || !endTime) {
      throw new BadRequestException(
        'startTime and endTime are required for Apple Watch data',
      );
    }

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    // Check for existing data to prevent duplicates
    const existingData = await this.prisma.healthData.findUnique({
      where: {
        userId_startTime_endTime_dataSource: {
          userId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          dataSource,
        },
      },
    });

    if (existingData) {
      // Update existing record instead of creating duplicate
      return this.updateHealthData(existingData.id, createHealthDataDto);
    }

    // Create health data with Apple Watch specifics
    return this.prisma.healthData.create({
      data: {
        userId,
        steps,
        heartRate,
        activeCalories,
        restingHeartRate,
        heartRateVariability,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        dataSource,
        deviceName,
        syncSessionId,
        isManualEntry: false,
        dataQuality: 'GOOD',
        sleepData: sleepData
          ? {
              create: {
                deepMinutes: sleepData.deepMinutes,
                lightMinutes: sleepData.lightMinutes,
                remMinutes: sleepData.remMinutes,
                awakeMinutes: sleepData.awakeMinutes,
                coreMinutes: sleepData.coreMinutes,
                sleepEfficiency: sleepData.sleepEfficiency,
                timeInBed: sleepData.timeInBed,
                sleepLatency: sleepData.sleepLatency,
                bedtimeStart: sleepData.bedtimeStart
                  ? new Date(sleepData.bedtimeStart)
                  : undefined,
                bedtimeEnd: sleepData.bedtimeEnd
                  ? new Date(sleepData.bedtimeEnd)
                  : undefined,
                consistency: sleepData.consistency,
              },
            }
          : undefined,
        workoutData: workoutData
          ? {
              create: {
                workoutType: workoutData.workoutType,
                duration: workoutData.duration,
                totalDistance: workoutData.totalDistance,
                totalEnergy: workoutData.totalEnergy,
                avgHeartRate: workoutData.avgHeartRate,
                maxHeartRate: workoutData.maxHeartRate,
                minHeartRate: workoutData.minHeartRate,
                elevation: workoutData.elevation,
                routeData: workoutData.routeData,
              },
            }
          : undefined,
      },
      include: {
        sleepData: true,
        workoutData: true,
      },
    });
  }

  async batchSyncAppleWatchData(
    healthDataArray: CreateHealthDataDto[],
  ): Promise<BatchSyncResponse> {
    const results: BatchSyncResult[] = [];

    for (const healthData of healthDataArray) {
      try {
        const result = await this.syncAppleWatchData(healthData);
        results.push({ success: true, data: result });
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          data: healthData,
        });
      }
    }

    return {
      total: healthDataArray.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
  async getUserHealthData(
    userId: string,
    date?: string,
    range?: 'day' | 'week' | 'month',
  ): Promise<HealthDataResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    try {
      const { startDate, endDate } = DateUtils.getDateRange(date, range);

      const healthData = await this.prisma.healthData.findMany({
        where: {
          userId,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          sleepData: true,
          workoutData: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return this.calculateHealthSummary(healthData);
    } catch (error) {
      throw new BadRequestException('Invalid date parameters');
    }
  }

  //   async getUserHealthData(userId: string, date: string, range?: 'day' | 'week' | 'month'): Promise<HealthDataResponse> {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       throw new NotFoundException(`User with ID ${userId} not found`);
  //     }

  //     let startDate: Date;
  //     let endDate: Date;

  //     if (range === 'week') {
  //       startDate = new Date(date);
  //       startDate.setDate(startDate.getDate() - 7);
  //       endDate = new Date(date);
  //     } else if (range === 'month') {
  //       startDate = new Date(date);
  //       startDate.setMonth(startDate.getMonth() - 1);
  //       endDate = new Date(date);
  //     } else {
  //       // Default to single day
  //       startDate = new Date(date);
  //       startDate.setHours(0, 0, 0, 0);
  //       endDate = new Date(date);
  //       endDate.setHours(23, 59, 59, 999);
  //     }

  //     const healthData = await this.prisma.healthData.findMany({
  //       where: {
  //         userId,
  //         startTime: {
  //           gte: startDate,
  //           lte: endDate,
  //         },
  //       },
  //       include: {
  //         sleepData: true,
  //         workoutData: true,
  //       },
  //       orderBy: { startTime: 'asc' },
  //     });

  //     return this.calculateHealthSummary(healthData);
  //   }

  private async updateHealthData(id: string, updateData: CreateHealthDataDto) {
    return this.prisma.healthData.update({
      where: { id },
      data: {
        steps: updateData.steps,
        heartRate: updateData.heartRate,
        activeCalories: updateData.activeCalories,
        restingHeartRate: updateData.restingHeartRate,
        heartRateVariability: updateData.heartRateVariability,
        // Update related data if needed
      },
      include: {
        sleepData: true,
        workoutData: true,
      },
    });
  }

  private calculateHealthSummary(healthData: any[]): HealthDataResponse {
    if (healthData.length === 0) {
      return {
        summary: null,
        detailedData: [],
      };
    }

    const summary: HealthSummary = {
      totalSteps: healthData.reduce((sum, data) => sum + (data.steps || 0), 0),
      avgHeartRate: this.calculateAverage(healthData.map((d) => d.heartRate)),
      avgRestingHeartRate: this.calculateAverage(
        healthData.map((d) => d.restingHeartRate),
      ),
      totalActiveCalories: healthData.reduce(
        (sum, data) => sum + (data.activeCalories || 0),
        0,
      ),
      totalSleepHours: this.calculateTotalSleep(healthData),
      workoutCount: healthData.filter((d) => d.workoutData).length,
      dataPoints: healthData.length,
      timeRange: {
        start: healthData[0].startTime,
        end: healthData[healthData.length - 1].endTime,
      },
    };

    return {
      summary,
      detailedData: healthData,
    };
  }

  private calculateAverage(values: (number | null | undefined)[]): number {
    const validValues = values.filter((v): v is number => v != null);
    if (validValues.length === 0) return 0;
    return Number(
      (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1),
    );
  }

  private calculateTotalSleep(healthData: any[]): number {
    const totalSleepMinutes = healthData.reduce((sum, data) => {
      if (data.sleepData) {
        const sleep = data.sleepData;
        return (
          sum +
          (sleep.deepMinutes || 0) +
          (sleep.lightMinutes || 0) +
          (sleep.remMinutes || 0)
        );
      }
      return sum;
    }, 0);

    return Number((totalSleepMinutes / 60).toFixed(1));
  }

  // Get sync status for debugging
  async getSyncStatus(userId: string): Promise<SyncStatusResponse> {
    const latestSync = await this.prisma.healthData.findFirst({
      where: { userId },
      orderBy: { fetchTime: 'desc' },
      select: {
        fetchTime: true,
        dataSource: true,
        deviceName: true,
        syncSessionId: true,
      },
    });

    const todayData = await this.prisma.healthData.count({
      where: {
        userId,
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      lastSync: latestSync?.fetchTime || null,
      dataSource: latestSync?.dataSource || null,
      deviceName: latestSync?.deviceName || null,
      syncSessionId: latestSync?.syncSessionId || null,
      todayDataPoints: todayData,
      isSyncedRecently: latestSync
        ? Date.now() - latestSync.fetchTime.getTime() < 24 * 60 * 60 * 1000
        : false,
    };
  }
}

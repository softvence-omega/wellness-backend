// src/health-data/health-data.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CreateHealthDataDto } from './dto/create-health-data.dto';
import {
  BatchSyncResponse,
  HealthDataResponse,
  HealthDataService,
  SyncStatusResponse,
} from './watch-data.service';

@Controller('health-data')
export class HealthDataController {
  [x: string]: any;
  constructor(private readonly healthDataService: HealthDataService) {}

  @Post('sync')
  async syncHealthData(@Body() createHealthDataDto: CreateHealthDataDto) {
    return this.healthDataService.syncAppleWatchData(createHealthDataDto);
  }

  @Post('batch-sync')
  async batchSyncHealthData(
    @Body() healthDataArray: CreateHealthDataDto[],
  ): Promise<BatchSyncResponse> {
    return this.healthDataService.batchSyncAppleWatchData(healthDataArray);
  }

  @Get('user/:userId')
  async getUserHealthData(
    @Param('userId') userId: string,
    @Query('date') date?: string,
    @Query('range') range?: 'day' | 'week' | 'month',
  ): Promise<HealthDataResponse> {
    return this.healthDataService.getUserHealthData(userId, date, range);
  }

  // Add this to your controller temporarily
  @Get('user/:userId/debug')
  async debugUserHealthData(@Param('userId') userId: string) {
    const allData = await this.healthDataService['prisma'].healthData.findMany({
      where: { userId },
      include: {
        sleepData: true,
        workoutData: true,
      },
      orderBy: { startTime: 'desc' },
    });

    if (!allData.length) {
      throw new NotFoundException(`No health data found for user ID ${userId}`);
    }

    return {
      totalRecords: allData.length,
      data: allData.map((item) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        steps: item.steps,
        heartRate: item.heartRate,
        activeCalories: item.activeCalories,
        restingHeartRate: item.restingHeartRate,
        heartRateVariability: item.heartRateVariability,
        dataSource: item.dataSource,
        deviceName: item.deviceName,
        syncSessionId: item.syncSessionId,
        sleepData: item.sleepData,
        workoutData: item.workoutData,
        createdAt: item.createdAt,
      })),
    };
  }
  @Get('user/:userId/today')
  async getTodayHealthData(
    @Param('userId') userId: string,
  ): Promise<HealthDataResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.healthDataService.getUserHealthData(userId, today, 'day');
  }

  @Get('user/:userId/trends')
  async getHealthTrends(
    @Param('userId') userId: string,
    @Query('days') days: number = 7,
  ): Promise<HealthDataResponse> {
    const endDate = new Date().toISOString().split('T')[0];
    return this.healthDataService.getUserHealthData(userId, endDate, 'week');
  }

  @Get('user/:userId/sync-status')
  async getSyncStatus(
    @Param('userId') userId: string,
  ): Promise<SyncStatusResponse> {
    return this.healthDataService.getSyncStatus(userId);
  }

  @Get('user/:userId/summary')
  async getHealthSummary(
    @Param('userId') userId: string,
  ): Promise<HealthDataResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.healthDataService.getUserHealthData(userId, today, 'day');
  }
}

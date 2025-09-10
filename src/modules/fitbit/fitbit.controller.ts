import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { FitbitService, TokenData } from './fitbit.service';

@Controller('fitbit')
export class FitbitController {
  constructor(private readonly fitbitService: FitbitService) {}

  // Redirect to Fitbit OAuth
  @Get('connect/:userId')
  @Redirect()
  connect(@Param('userId') userId: string) {
    const url = this.fitbitService.getAuthUrl(userId);
    return { url };
  }

  // OAuth callback
  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') userId: string) {
    return this.fitbitService.exchangeCodeForToken(code, userId);
  }

  // Get Fitbit profile
  @Get(':userId/profile')
  getProfile(@Param('userId') userId: string) {
    return this.fitbitService.getProfile(userId);
  }

  @Get(':userId/devices')
  getDevices(@Param('userId') userId: string) {
    return this.fitbitService.getDevices(userId);
  }

  @Get(':userId/activity')
  getActivity(@Param('userId') userId: string, @Query('date') date?: string) {
    return this.fitbitService.getActivity(userId, date);
  }

  @Get(':userId/heartrate')
  getHeartRate(@Param('userId') userId: string, @Query('date') date?: string) {
    return this.fitbitService.getHeartRate(userId, date);
  }

  @Get(':userId/sleep')
  getSleep(@Param('userId') userId: string, @Query('date') date?: string) {
    return this.fitbitService.getSleep(userId, date);
  }

  @Get(':userId/weight')
  getWeight(@Param('userId') userId: string) {
    return this.fitbitService.getWeight(userId);
  }

  @Get(':userId/connections')
  getConnections(@Param('userId') userId: string): any {
    return this.fitbitService.getConnections(userId);
  }
}

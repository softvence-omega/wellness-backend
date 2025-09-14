import { Controller, Get, Param, Query } from '@nestjs/common';
import { StravaService } from './strava.service';
import { successResponse } from 'src/common/response';

@Controller('strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  // Connect Strava for a user (redirect URL with userId as state)
  @Get('connect/:userId')
  connect(@Param('userId') userId: string) {
    const url = this.stravaService.getAuthUrl(userId);
    return { url };
  }

  // OAuth callback (Strava sends back code + state=userId)
  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') userId: string) {
    await this.stravaService.exchangeCodeForToken(code, userId);
    return successResponse(null, 'Strava connected successfully');
  }

  // Get Strava athlete profile
  @Get('profile/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.stravaService.getProfile(userId);
  }

  // Get Strava activities
  @Get('activities/:userId')
  getActivities(@Param('userId') userId: string, @Query('after') after?: number, @Query('before') before?: number) {
    return this.stravaService.getActivities(userId, after, before);
  }

  // Get token info (optional, for testing)
  @Get('connections/:userId')
  getConnections(@Param('userId') userId: string) {
    return this.stravaService.getConnections(userId);
  }
}

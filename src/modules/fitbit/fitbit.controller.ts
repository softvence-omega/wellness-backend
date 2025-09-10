import { Controller, Get, Param, Query } from '@nestjs/common';
import { FitbitService } from './fitbit.service';
import { successResponse } from 'src/common/response';

@Controller('fitbit')
export class FitbitController {
    constructor(private readonly fitbitService: FitbitService) { }

    // Connect Fitbit for a user (redirect URL with userId as state)
    @Get('connect/:userId')
    connect(@Param('userId') userId: string) {
        const url = this.fitbitService.getAuthUrl(userId);
        return { url };
    }

    // OAuth callback (Fitbit sends back code + state=userId)
    @Get('callback')
    async callback(@Query('code') code: string, @Query('state') userId: string) {
        const reuslt = await this.fitbitService.exchangeCodeForToken(code, userId);
        return successResponse(null, "Fitbit connected successfully")
    }

    // Get Fitbit profile
    @Get('profile/:userId')
    getProfile(@Param('userId') userId: string) {
        return this.fitbitService.getProfile(userId);
    }



    @Get('activity/:userId')
    getActivity(@Param('userId') userId: string, @Query('date') date?: string) {
        return this.fitbitService.getActivity(userId, date);
    }

    @Get('heartrate/:userId')
    getHeartRate(@Param('userId') userId: string, @Query('date') date?: string) {
        return this.fitbitService.getHeartRate(userId, date);
    }

    @Get('sleep/:userId')
    getSleep(@Param('userId') userId: string, @Query('date') date?: string) {
        return this.fitbitService.getSleep(userId, date);
    }

    @Get('weight/:userId')
    getWeight(@Param('userId') userId: string) {
        return this.fitbitService.getWeight(userId);
    }

    @Get('connections/:userId')
    getConnections(@Param('userId') userId: string) {
        return this.fitbitService.getConnections(userId);
    }
}

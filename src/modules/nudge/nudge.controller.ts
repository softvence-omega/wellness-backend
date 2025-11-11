import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
} from '@nestjs/common';

import { CreateNudgeDto } from './dto/create-nudge.dto';
import { UpdateNudgeDto } from './dto/update-nudge.dto';
import { UpdateNudgeProgressDto } from './dto/update-nudge-progress.dto';
import { NudgeQueryDto } from './dto/nudge-query.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NudgesService } from './nudge.service';
import { GetNudgesQueryDto } from './dto/nudges.dto';
import { SetNotificationsDto } from './dto/senatificaitons.dto';


@ApiTags('nudges')
@ApiBearerAuth()
@Controller('nudges')
@UseGuards(JwtAuthGuard)
export class NudgesController {
  constructor(private readonly nudgesService: NudgesService) {}


  @Post()
  @ApiOperation({ summary: 'Create sleep record' })
  @ApiResponse({ status: 201, description: 'Sleep record created successfully' })
  async (@Body() dto: SetNotificationsDto ,req) {
    if (!req.user) {
      throw new BadRequestException(
        'User not authenticated - req.user is undefined',
      );
    }

    if (!req.user.userId) {
      throw new BadRequestException(
        `User ID is required. User object: ${JSON.stringify(req.user)}`,
      );
    }
    return this.nudgesService.setNotificationServices(dto,req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createNudgeDto: CreateNudgeDto) {
    console.log('Request user:', req.user);
    console.log('User ID:', req.user?.userId);
    console.log('User keys:', req.user ? Object.keys(req.user) : 'No user');
    if (!req.user) {
      throw new BadRequestException(
        'User not authenticated - req.user is undefined',
      );
    }

    if (!req.user.userId) {
      throw new BadRequestException(
        `User ID is required. User object: ${JSON.stringify(req.user)}`,
      );
    }
    return this.nudgesService.create(req.user.userId, createNudgeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all nudges for a user with optional filters and pagination',
    description:
      'Retrieves nudges for the authenticated user, filtered by category, completion status, or date. Use `date=YYYY-MM-DD` to fetch nudges on or after the specified date, `date=upcoming` for nudges on or after today, or `date=today` for nudges today only. Supports pagination with `take` and `cursor`.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Nudges retrieved successfully or error details in response message. Returns an array of nudges, total pages, current page, success status, and next cursor for pagination.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid query parameters (e.g., invalid date format or cursor).',
  })
  async findAll(
    @Request() req,
    @Query() query: GetNudgesQueryDto,
    @Res() res: Response,
  ) {
    console.log('Request user in findAll:', req.user);
    const userId = req.user?.userId || req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(HttpStatus.OK).json({
        data: [],
        message: 'User ID is missing. Please authenticate and try again.',
        totalPages: 0,
        currentPage: 0,
        success: false,
        nextCursor: null,
      });
    }

    const response = await this.nudgesService.findAll(userId, query);
    return res.status(HttpStatus.OK).json(response);
  }

  @Get('today-progress')
  @ApiOperation({ summary: 'Get today progress' })
  @ApiResponse({
    status: 200,
    description: 'Today progress retrieved successfully',
  })
  getTodayProgress(@Request() req) {
    return this.nudgesService.getTodayProgress(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get nudge statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  getStats(@Request() req) {
    return this.nudgesService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a nudge by ID' })
  @ApiResponse({ status: 200, description: 'Nudge retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Nudge not found' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.nudgesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a nudge' })
  @ApiResponse({ status: 200, description: 'Nudge updated successfully' })
  @ApiResponse({ status: 404, description: 'Nudge not found' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNudgeDto: UpdateNudgeDto,
  ) {
    return this.nudgesService.update(id, req.user.id, updateNudgeDto);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update nudge progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({ status: 404, description: 'Nudge not found' })
  updateProgress(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNudgeProgressDto: UpdateNudgeProgressDto,
  ) {
    return this.nudgesService.updateProgress(
      id,
      req.user.id,
      updateNudgeProgressDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a nudge' })
  @ApiResponse({ status: 204, description: 'Nudge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Nudge not found' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.nudgesService.remove(id, req.user.id);
  }
}

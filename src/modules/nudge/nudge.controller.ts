// src/nudges/nudges.controller.ts
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
} from '@nestjs/common';

import { CreateNudgeDto } from './dto/create-nudge.dto';
import { UpdateNudgeDto } from './dto/update-nudge.dto';
import { UpdateNudgeProgressDto } from './dto/update-nudge-progress.dto';
import { NudgeQueryDto } from './dto/nudge-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NudgesService } from './nudge.service';

@ApiTags('nudges')
@ApiBearerAuth()
@Controller('nudges')
@UseGuards(JwtAuthGuard)
export class NudgesController {
  constructor(private readonly nudgesService: NudgesService) {}

@Post()
create(@Request() req, @Body() createNudgeDto: CreateNudgeDto) {
  
  console.log('Request user:', req.user);
  console.log('User ID:', req.user?.userId); // Changed from .id to .userId
  console.log('User keys:', req.user ? Object.keys(req.user) : 'No user');

  // Check if user exists and has userId
  if (!req.user) {
    throw new BadRequestException('User not authenticated - req.user is undefined');
  }

  if (!req.user.userId) { // Changed from .id to .userId
    throw new BadRequestException(`User ID is required. User object: ${JSON.stringify(req.user)}`);
  }

  return this.nudgesService.create(req.user.userId, createNudgeDto); // Changed from .id to .userId
}


  @Get('today-progress')
  @ApiOperation({ summary: 'Get today progress' })
  @ApiResponse({ status: 200, description: 'Today progress retrieved successfully' })
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
  update(@Request() req, @Param('id') id: string, @Body() updateNudgeDto: UpdateNudgeDto) {
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
    return this.nudgesService.updateProgress(id, req.user.id, updateNudgeProgressDto);
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
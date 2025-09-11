import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NudgeService } from './nudge.service';
import { CreateNudgeDto } from './dto/create-nudge.dto';
import { UpdateNudgeDto } from './dto/update-nudge.dto';
import { successResponse } from 'src/common/response';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nudge')
export class NudgeController {
  constructor(private readonly nudgeService: NudgeService) {}

  // Create Nudge
  @Roles('ADMIN', 'USER')
  @Post('create-nudge')
  async create(@Req() req: any, @Body() dto: CreateNudgeDto) {
    const userId = req.user.userId;
    const result = await this.nudgeService.create(userId, dto);
    return successResponse(result, 'Nudge created successfully');
  }

  // Get All Nudges (with pagination)
  @Roles('ADMIN', 'USER')
  @Get('get-all-nudge')
  async findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.userId;
    const result = await this.nudgeService.findAll(userId, Number(page), Number(limit));
    return successResponse(result, 'Nudges fetched successfully');
  }

  // Get Single Nudge
  @Roles('ADMIN', 'USER')
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const result = await this.nudgeService.findOne(Number(id), userId);
    return successResponse(result, 'Nudge fetched successfully');
  }

  // Update Nudge
  @Roles('ADMIN', 'USER')
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateNudgeDto,
  ) {
    const userId = req.user.userId;
    const result = await this.nudgeService.update(Number(id), userId, dto);
    return successResponse(result, 'Nudge updated successfully');
  }

  // Delete Nudge
  @Roles('ADMIN', 'USER')
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const result = await this.nudgeService.remove(Number(id), userId);
    return successResponse(result, 'Nudge deleted successfully');
  }
}

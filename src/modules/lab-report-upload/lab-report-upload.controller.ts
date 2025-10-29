// controllers/lab-report.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LabReportService } from './lab-report-upload.service';
import { UploadLabReportDto } from './dto/upload-lab-report.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { CurrentUser } from './decorator/current-user.decorator';

@ApiTags('lab-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lab-reports')
export class LabReportController {
  constructor(private readonly labReportService: LabReportService) {}

  // lab-report.controller.ts - Update your upload method
  @Post('upload')
  @UseInterceptors(FileInterceptor('reportFile'))
  async uploadLabReport(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('🔍 USER OBJECT:', req.user);
    console.log('🔍 USER ID:', req.user?.id);
    console.log('🔍 ALL REQUEST HEADERS:', req.headers);

    // Check different possible user ID fields
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    console.log('🔍 EXTRACTED USER ID:', userId);

    if (!userId) {
      return {
        success: false,
        message: 'User authentication failed - no user ID found',
        debug: {
          userObject: req.user,
          availableKeys: req.user ? Object.keys(req.user) : 'No user object',
        },
      };
    }

    return this.labReportService.uploadLabReport(userId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab reports for current user' })
  @ApiResponse({
    status: 200,
    description: 'Lab reports retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAllLabReports(@CurrentUser() user: any) {
    return this.labReportService.getAllLabReports(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific lab report by ID' })
  @ApiParam({ name: 'id', description: 'Lab Report ID' })
  @ApiResponse({
    status: 200,
    description: 'Lab report retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Lab report not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getLabReportById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.labReportService.getLabReportById(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a lab report' })
  @ApiParam({ name: 'id', description: 'Lab Report ID' })
  @ApiResponse({
    status: 200,
    description: 'Lab report deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Lab report not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteLabReport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.labReportService.deleteLabReport(user.id, id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete multiple lab reports' })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 200,
    description: 'Lab reports deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No IDs provided',
  })
  @ApiResponse({
    status: 404,
    description: 'No lab reports found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async bulkDeleteLabReports(
    @CurrentUser() user: any,
    @Body() bulkDeleteDto: BulkDeleteDto,
  ) {
    return this.labReportService.bulkDeleteLabReports(
      user.id,
      bulkDeleteDto.ids,
    );
  }
}

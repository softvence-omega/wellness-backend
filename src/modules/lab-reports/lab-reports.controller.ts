// src/medical-reports/medical-reports.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
 // Fixed import path

import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';

import { IMedicalReportFilters, LabValue } from './interfaces/medical-report.interface';
import { MedicalReportsService } from './lab-reports.service';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { MedicalReportResponseDto, PaginatedMedicalReportsResponseDto } from './dto/medical-report-response.dto';
 // Fixed import name

@ApiTags('medical-reports')
@ApiBearerAuth()
@Controller('medical-reports')
@UseGuards(JwtAuthGuard)
export class MedicalReportsController {
  constructor(private readonly medicalReportsService: MedicalReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical report' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Medical report created successfully',
    type: MedicalReportResponseDto,
  })
  async create(
    @Body() createMedicalReportDto: CreateMedicalReportDto,
    @GetUser() user: any, // Get full user object first for debugging
  ): Promise<MedicalReportResponseDto> {
    console.log('Full user object from GetUser:', user); // Debug log
    
    // Extract userId from user object
    const userId = user?.id || user?.sub || user?.userId;
    console.log('Extracted userId:', userId); // Debug log
    
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    const report = await this.medicalReportsService.create(createMedicalReportDto, userId);
    return this.toResponseDto(report);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical reports for the authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'reportType', required: false, enum: ['CBC', 'LFT', 'KFT', 'THYROID', 'MRI', 'CT_SCAN', 'X_RAY', 'ULTRASOUND', 'ECG', 'BLOOD_TEST', 'URINE_TEST', 'OTHER'] })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns paginated medical reports',
    type: PaginatedMedicalReportsResponseDto,
  })
  async findAll(
    @GetUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('reportType') reportType?: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedMedicalReportsResponseDto> {
    const filters: IMedicalReportFilters = {
      userId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      reportType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    };

    const result = await this.medicalReportsService.findAll(filters);
    
    return {
      reports: result.reports.map(report => this.toResponseDto(report)),
      pagination: result.pagination,
    };
  }

 @Get(':id')
  @ApiOperation({ summary: 'Get a specific medical report by ID' })
  @ApiParam({ name: 'id', description: 'Medical report ID (CUID format)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the medical report',
    type: MedicalReportResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Medical report not found' 
  })
  async findOne(
    @Param('id') id: string, // Remove ParseUUIDPipe for CUID
    @GetUser('id') userId: string,
  ): Promise<MedicalReportResponseDto> {
    // Add custom validation for CUID format
    if (!id || id.length < 10) {
      throw new BadRequestException('Invalid medical report ID format');
    }

    const report = await this.medicalReportsService.findOne(id, userId);
    return this.toResponseDto(report);
  }

  @Get(':id/abnormal-values')
  @ApiOperation({ summary: 'Get abnormal lab values from a medical report' })
  @ApiParam({ name: 'id', description: 'Medical report ID (CUID format)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns abnormal lab values',
  })
  async getAbnormalValues(
    @Param('id') id: string, // Remove ParseUUIDPipe
    @GetUser('id') userId: string,
  ): Promise<LabValue[]> {
    if (!id || id.length < 10) {
      throw new BadRequestException('Invalid medical report ID format');
    }

    return await this.medicalReportsService.getAbnormalLabValues(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a medical report' })
  @ApiParam({ name: 'id', description: 'Medical report ID (CUID format)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Medical report updated successfully',
    type: MedicalReportResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Medical report not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Report with this file name already exists' 
  })
  async update(
    @Param('id') id: string, // Remove ParseUUIDPipe
    @Body() updateMedicalReportDto: UpdateMedicalReportDto,
    @GetUser('id') userId: string,
  ): Promise<MedicalReportResponseDto> {
    if (!id || id.length < 10) {
      throw new BadRequestException('Invalid medical report ID format');
    }

    const report = await this.medicalReportsService.update(id, userId, updateMedicalReportDto);
    return this.toResponseDto(report);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a medical report' })
  @ApiParam({ name: 'id', description: 'Medical report ID (CUID format)' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Medical report deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Medical report not found' 
  })
  async remove(
    @Param('id') id: string, // Remove ParseUUIDPipe
    @GetUser('id') userId: string,
  ): Promise<void> {
    if (!id || id.length < 10) {
      throw new BadRequestException('Invalid medical report ID format');
    }

    await this.medicalReportsService.remove(id, userId);
  }
  private toResponseDto(report: any): MedicalReportResponseDto {
    // Parse reportData if it's a string, otherwise use as-is
    const reportData = typeof report.reportData === 'string' 
      ? JSON.parse(report.reportData) 
      : report.reportData;

    return {
      id: report.id,
      fileName: report.fileName,
      fileUrl: report.fileUrl,
      reportType: report.reportType,
      patientName: report.patientName,
      reportDate: report.reportDate,
      labName: report.labName || undefined, // Convert null to undefined
      doctorName: report.doctorName || undefined, // Convert null to undefined
      reportData: reportData,
      userId: report.userId,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
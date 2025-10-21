// src/medical-reports/medical-reports.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { 
  IMedicalReport, 
  ICreateMedicalReport, 
  IUpdateMedicalReport, 
  IMedicalReportFilters,
  IPaginatedMedicalReports,
  ReportData 
} from './interfaces/medical-report.interface';

@Injectable()
export class MedicalReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

async create(data: ICreateMedicalReport): Promise<IMedicalReport> {
    try {
      // Make sure userId is provided and valid
      if (!data.userId) {
        throw new Error('User ID is required');
      }

      // Verify user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!userExists) {
        throw new Error('User not found');
      }

      const result = await this.prisma.medicalReport.create({
        data: {
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          reportType: data.reportType,
          patientName: data.patientName,
          reportDate: data.reportDate,
          labName: data.labName || null,
          doctorName: data.doctorName || null,
          reportData: data.reportData as any,
          userId: data.userId, // This should NOT be undefined
        },
      });

      return this.toIMedicalReport(result);
    } catch (error) {
      throw new Error(`Failed to create medical report: ${error.message}`);
    }
  }

  async findById(id: string, userId: string): Promise<IMedicalReport> {
    const report = await this.prisma.medicalReport.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!report) {
      throw new NotFoundException(`Medical report with ID ${id} not found`);
    }

    return this.toIMedicalReport(report);
  }

  async findAll(filters: IMedicalReportFilters): Promise<IPaginatedMedicalReports> {
    const {
      page = 1,
      limit = 10,
      reportType,
      startDate,
      endDate,
      search,
      userId,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId,
    };

    if (reportType) {
      where.reportType = reportType;
    }

    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) {
        where.reportDate.gte = startDate;
      }
      if (endDate) {
        where.reportDate.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { labName: { contains: search, mode: 'insensitive' } },
        { doctorName: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [reports, total] = await Promise.all([
        this.prisma.medicalReport.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            reportDate: 'desc',
          },
        }),
        this.prisma.medicalReport.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        reports: reports.map(report => this.toIMedicalReport(report)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch medical reports: ${error.message}`);
    }
  }

  async update(id: string, userId: string, data: IUpdateMedicalReport): Promise<IMedicalReport> {
    // Check if report exists and belongs to user
    await this.findById(id, userId);

    try {
      // Prepare data for Prisma (convert undefined to null for optional fields)
      const prismaData: any = { ...data };
      
      if (data.labName === undefined) {
        delete prismaData.labName;
      } else {
        prismaData.labName = data.labName || null;
      }
      
      if (data.doctorName === undefined) {
        delete prismaData.doctorName;
      } else {
        prismaData.doctorName = data.doctorName || null;
      }

      // Handle reportData conversion if present
      if (data.reportData) {
        prismaData.reportData = data.reportData as any;
      }

      const result = await this.prisma.medicalReport.update({
        where: { id },
        data: prismaData,
      });

      return this.toIMedicalReport(result);
    } catch (error) {
      throw new Error(`Failed to update medical report: ${error.message}`);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    // Check if report exists and belongs to user
    await this.findById(id, userId);

    try {
      await this.prisma.medicalReport.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete medical report: ${error.message}`);
    }
  }

  async checkFileNameExists(fileName: string, userId: string, excludeId?: string): Promise<boolean> {
    const where: any = {
      fileName,
      userId,
    };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await this.prisma.medicalReport.count({ where });
    return count > 0;
  }

  // Helper method to convert Prisma result to IMedicalReport
  private toIMedicalReport(prismaReport: any): IMedicalReport {
    return {
      id: prismaReport.id,
      fileName: prismaReport.fileName,
      fileUrl: prismaReport.fileUrl,
      reportType: prismaReport.reportType,
      patientName: prismaReport.patientName,
      reportDate: prismaReport.reportDate,
      labName: prismaReport.labName,
      doctorName: prismaReport.doctorName,
      reportData: prismaReport.reportData,
      userId: prismaReport.userId,
      createdAt: prismaReport.createdAt,
      updatedAt: prismaReport.updatedAt,
    };
  }
}
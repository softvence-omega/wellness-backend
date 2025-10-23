// services/lab-report.service.ts
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { LabReportResponseDto } from './dto/lab-report-response.dto';


@Injectable()
export class LabReportService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];

    const maxSize = 10 * 1024 * 1024; 

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and PDF files are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 10MB.',
      );
    }
  }

  private mapToResponse(labReport: any): LabReportResponseDto {
    return new LabReportResponseDto({
      id: labReport.id,
      userId: labReport.userId,
      reportFile: labReport.reportFile,
      createdAt: labReport.createdAt,
    });
  }

  // CREATE - Upload Lab Report
  async uploadLabReport(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{
    success: boolean;
    message: string;
    data: LabReportResponseDto;
  }> {
    try {
      this.validateFile(file);

      let fileUrl: string;

      if (file.mimetype === 'application/pdf') {
        fileUrl = await this.cloudinary.uploadPDF(file);
      } else if (file.mimetype.startsWith('image/')) {
        fileUrl = await this.cloudinary.uploadImage(file);
      } else {
        throw new BadRequestException('Unsupported file type');
      }

      const labReport = await this.prisma.labReport.create({
        data: {
          userId: userId,
          reportFile: fileUrl,
        },
      });

      return {
        success: true,
        message: 'Lab report uploaded successfully',
        data: this.mapToResponse(labReport),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to upload lab report: ${error.message}`,
      );
    }
  }

  // READ - Get All Lab Reports
  async getAllLabReports(userId: string): Promise<{
    success: boolean;
    message: string;
    data: LabReportResponseDto[];
  }> {
    try {
      const labReports = await this.prisma.labReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        message: 'Lab reports retrieved successfully',
        data: labReports.map(report => this.mapToResponse(report)),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve lab reports: ${error.message}`,
      );
    }
  }

  // READ - Get Single Lab Report
  async getLabReportById(
    userId: string,
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: LabReportResponseDto;
  }> {
    try {
      const labReport = await this.prisma.labReport.findFirst({
        where: { id, userId },
      });

      if (!labReport) {
        throw new NotFoundException(`Lab report with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Lab report retrieved successfully',
        data: this.mapToResponse(labReport),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to retrieve lab report: ${error.message}`,
      );
    }
  }

  // DELETE - Single Lab Report
  async deleteLabReport(
    userId: string,
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const labReport = await this.prisma.labReport.findFirst({
        where: { id, userId },
      });

      if (!labReport) {
        throw new NotFoundException(`Lab report with ID ${id} not found`);
      }

      // Delete from Cloudinary
      try {
        const publicId = this.cloudinary.extractPublicId(labReport.reportFile);
        if (publicId) {
          await this.cloudinary.deleteFile(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError);
      }

      // Delete from database
      await this.prisma.labReport.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Lab report deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete lab report: ${error.message}`,
      );
    }
  }

  // BULK DELETE - Multiple Lab Reports
  async bulkDeleteLabReports(
    userId: string,
    ids: string[],
  ): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    try {
      if (!ids || ids.length === 0) {
        throw new BadRequestException('No IDs provided for deletion');
      }

      const labReports = await this.prisma.labReport.findMany({
        where: { id: { in: ids }, userId },
      });

      if (labReports.length === 0) {
        throw new NotFoundException('No lab reports found for deletion');
      }

      // Delete files from Cloudinary
      const deletePromises = labReports.map(async (report) => {
        try {
          const publicId = this.cloudinary.extractPublicId(report.reportFile);
          if (publicId) {
            await this.cloudinary.deleteFile(publicId);
          }
        } catch (error) {
          console.error(`Failed to delete file ${report.id}:`, error);
        }
      });

      await Promise.all(deletePromises);

      // Delete from database
      const deleteResult = await this.prisma.labReport.deleteMany({
        where: { id: { in: ids }, userId },
      });

      return {
        success: true,
        message: `${deleteResult.count} lab report(s) deleted successfully`,
        deletedCount: deleteResult.count,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete lab reports: ${error.message}`,
      );
    }
  }
}
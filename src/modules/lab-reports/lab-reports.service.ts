// src/medical-reports/medical-reports.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IMedicalReport,
  ICreateMedicalReport,
  IUpdateMedicalReport,
  IMedicalReportFilters,
  IPaginatedMedicalReports,
  ReportData,
  LabValue,
} from './interfaces/medical-report.interface';
import { MedicalReportsRepository } from './medical-reports.repository';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class MedicalReportsService {
  constructor(
    private readonly repository: MedicalReportsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createMedicalReportDto: CreateMedicalReportDto,
    userId: string,
  ): Promise<IMedicalReport> {
    // Check if file name already exists for this user
    const fileNameExists = await this.repository.checkFileNameExists(
      createMedicalReportDto.fileName,
      userId,
    );

    if (fileNameExists) {
      throw new ConflictException(
        `A report with file name '${createMedicalReportDto.fileName}' already exists`,
      );
    }

    // Validate report date is not in the future
    if (createMedicalReportDto.reportDate > new Date()) {
      throw new BadRequestException('Report date cannot be in the future');
    }

    // Validate report data structure
    this.validateReportData(createMedicalReportDto.reportData);

    const createData: ICreateMedicalReport = {
      ...createMedicalReportDto,
      userId,
    };

    try {
      return await this.repository.create(createData);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //////////// NEW METHOD ////////////
  // async uploadFile(
  //     dto: CreateMedicalReportDto,
  //     userId: string,
  //     file: Express.Multer.File,
  //   ): Promise<IMedicalReport> {
  //     // Validate file
  //     if (!file) {
  //       throw new BadRequestException('File is required');
  //     }

  //     // Check file name uniqueness
  //     const fileNameExists = await this.repository.checkFileNameExists(dto.fileName, userId);
  //     if (fileNameExists) {
  //       throw new ConflictException(`A file with name '${dto.fileName}' already exists`);
  //     }

  //     // Upload to Cloudinary
  //     let fileUrl = '';
  //     let publicId = '';
  //     try {
  //       const uploadResult = await this.cloudinaryService.uploadFile(file);
  //       fileUrl = uploadResult.secure_url;
  //       publicId = uploadResult.public_id;
  //     } catch (error) {
  //       throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
  //     }

  //     const createData: ICreateMedicalReport = {
  //       fileName: dto.fileName,
  //       fileUrl,
  //       publicId,
  //       userId,
  //       reportType: 'OTHER', // Default for compatibility
  //       reportData: {}, // Default empty JSON
  //     };

  //     try {
  //       return await this.repository.create(createData);
  //     } catch (error) {
  //       // Clean up Cloudinary if DB operation fails
  //       await this.cloudinaryService.deleteFile(publicId, file.mimetype.includes('pdf') ? 'raw' : 'image');
  //       throw new InternalServerErrorException(`Failed to create file record: ${error.message}`);
  //     }
  //   }

  //   async getFileById(id: string, userId: string): Promise<IMedicalReport> {
  //     try {
  //       const report = await this.repository.findById(id, userId);
  //       return {
  //         id: report.id,
  //         fileName: report.fileName,
  //         fileUrl: report.fileUrl,
  //         publicId: report.publicId,
  //         userId: report.userId,
  //         createdAt: report.createdAt,
  //         updatedAt: report.updatedAt,
  //       };
  //     } catch (error) {
  //       if (error instanceof NotFoundException) {
  //         throw error;
  //       }
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }

  //   async getAllFiles(filters: IMedicalReportFilters): Promise<IPaginatedMedicalReports> {
  //     try {
  //       const result = await this.repository.findAll(filters);
  //       return {
  //         reports: result.reports.map(report => ({
  //           id: report.id,
  //           fileName: report.fileName,
  //           fileUrl: report.fileUrl,
  //           publicId: report.publicId,
  //           userId: report.userId,
  //           createdAt: report.createdAt,
  //           updatedAt: report.updatedAt,
  //         })),
  //         pagination: result.pagination,
  //       };
  //     } catch (error) {
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }

  //   async deleteFile(id: string, userId: string): Promise<void> {
  //     try {
  //       const report = await this.getFileById(id, userId);
  //       if (report.publicId) {
  //         await this.cloudinaryService.deleteFile(report.publicId, report.fileUrl.includes('.pdf') ? 'raw' : 'image');
  //       }
  //       await this.repository.delete(id, userId);
  //     } catch (error) {
  //       if (error instanceof NotFoundException) {
  //         throw error;
  //       }
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }

  /////////////// END NEW METHOD /////////////

  async findAll(
    filters: IMedicalReportFilters,
  ): Promise<IPaginatedMedicalReports> {
    try {
      return await this.repository.findAll(filters);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string, userId: string): Promise<IMedicalReport> {
    try {
      return await this.repository.findById(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    id: string,
    userId: string,
    updateMedicalReportDto: UpdateMedicalReportDto,
  ): Promise<IMedicalReport> {
    if (updateMedicalReportDto.fileName) {
      const fileNameExists = await this.repository.checkFileNameExists(
        updateMedicalReportDto.fileName,
        userId,
        id,
      );

      if (fileNameExists) {
        throw new ConflictException(
          `A report with file name '${updateMedicalReportDto.fileName}' already exists`,
        );
      }
    }

    if (
      updateMedicalReportDto.reportDate &&
      updateMedicalReportDto.reportDate > new Date()
    ) {
      throw new BadRequestException('Report date cannot be in the future');
    }

    if (updateMedicalReportDto.reportData) {
      this.validateReportData(updateMedicalReportDto.reportData);
    }

    try {
      return await this.repository.update(id, userId, updateMedicalReportDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      await this.repository.delete(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private validateReportData(reportData: ReportData): void {
    if (
      !reportData.patient_name ||
      !reportData.report_date ||
      !reportData.lab_values
    ) {
      throw new BadRequestException(
        'Report data must include patient_name, report_date, and lab_values',
      );
    }

    if (
      !Array.isArray(reportData.lab_values) ||
      reportData.lab_values.length === 0
    ) {
      throw new BadRequestException('lab_values must be a non-empty array');
    }

    reportData.lab_values.forEach((labValue: LabValue, index: number) => {
      if (
        !labValue.test_name ||
        labValue.value === undefined ||
        !labValue.unit ||
        !labValue.ref_ranges ||
        !labValue.status
      ) {
        throw new BadRequestException(
          `Lab value at index ${index} is missing required fields`,
        );
      }

      if (typeof labValue.value !== 'number' || isNaN(labValue.value)) {
        throw new BadRequestException(
          `Lab value at index ${index} must be a valid number`,
        );
      }

      const validStatuses = ['within', 'below', 'above', 'borderline'];
      if (!validStatuses.includes(labValue.status)) {
        throw new BadRequestException(
          `Lab value at index ${index} has invalid status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }
    });
  }

  // Additional method to get abnormal lab values
  async getAbnormalLabValues(
    reportId: string,
    userId: string,
  ): Promise<LabValue[]> {
    const report = await this.findOne(reportId, userId);

    // Parse the reportData if it's stored as string, or use directly if it's already an object
    const reportData =
      typeof report.reportData === 'string'
        ? JSON.parse(report.reportData)
        : report.reportData;

    return reportData.lab_values.filter(
      (labValue: LabValue) => labValue.status !== 'within',
    );
  }

  // Method to get reports with critical values - ADD THIS METHOD
  async getReportsWithCriticalValues(
    userId: string,
  ): Promise<IMedicalReport[]> {
    try {
      // Get all reports for the user
      const allReports = await this.repository.findAll({
        userId,
        limit: 1000, // Get a large number to filter
        page: 1,
      });

      // Filter reports that have critical lab values
      return allReports.reports.filter((report) => {
        // Parse the reportData if it's stored as string
        const reportData =
          typeof report.reportData === 'string'
            ? JSON.parse(report.reportData)
            : report.reportData;

        // Check if any lab value is critical (below or above normal range)
        return (
          reportData.lab_values &&
          reportData.lab_values.some(
            (labValue: LabValue) =>
              labValue.status === 'below' || labValue.status === 'above',
          )
        );
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get critical reports: ${error.message}`,
      );
    }
  }

  // Optional: Method to get reports with borderline values
  async getReportsWithBorderlineValues(
    userId: string,
  ): Promise<IMedicalReport[]> {
    try {
      const allReports = await this.repository.findAll({
        userId,
        limit: 1000,
        page: 1,
      });

      return allReports.reports.filter((report) => {
        const reportData =
          typeof report.reportData === 'string'
            ? JSON.parse(report.reportData)
            : report.reportData;

        return (
          reportData.lab_values &&
          reportData.lab_values.some(
            (labValue: LabValue) => labValue.status === 'borderline',
          )
        );
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get borderline reports: ${error.message}`,
      );
    }
  }

  // Optional: Method to get overall health summary
  async getHealthSummary(userId: string): Promise<{
    totalReports: number;
    criticalReports: number;
    borderlineReports: number;
    normalReports: number;
  }> {
    try {
      const allReports = await this.repository.findAll({
        userId,
        limit: 1000,
        page: 1,
      });

      let criticalCount = 0;
      let borderlineCount = 0;
      let normalCount = 0;

      allReports.reports.forEach((report) => {
        const reportData =
          typeof report.reportData === 'string'
            ? JSON.parse(report.reportData)
            : report.reportData;

        if (reportData.lab_values) {
          const hasCritical = reportData.lab_values.some(
            (labValue: LabValue) =>
              labValue.status === 'below' || labValue.status === 'above',
          );
          const hasBorderline = reportData.lab_values.some(
            (labValue: LabValue) => labValue.status === 'borderline',
          );

          if (hasCritical) {
            criticalCount++;
          } else if (hasBorderline) {
            borderlineCount++;
          } else {
            normalCount++;
          }
        }
      });

      return {
        totalReports: allReports.reports.length,
        criticalReports: criticalCount,
        borderlineReports: borderlineCount,
        normalReports: normalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get health summary: ${error.message}`,
      );
    }
  }
}

import { ReportType } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
// Import the custom type

export interface LabValue {
  test_name: string;
  value: number;
  unit: string;
  ref_ranges: string;
  status: 'within' | 'below' | 'above' | 'borderline';
}

export interface ReportData {
  patient_name: string;
  report_date: string;
  lab_values: LabValue[];
  wellness_insight?: string;
}

export interface IMedicalReport {
  id: string;
  fileName: string;
  fileUrl: string;
  reportType: ReportType;
  patientName?: string;
  reportDate?: Date;
  labName?: string | null;
  doctorName?: string | null;
  reportData?: JsonValue; // Use the custom JsonValue type
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMedicalReport {
  fileName: string;
  fileUrl: string;
  reportType: ReportType;
  patientName: string;
  reportDate: Date;
  labName?: string;
  doctorName?: string;
  reportData: ReportData; // Keep strict type for creation/validation
  userId: string;
}

export interface IUpdateMedicalReport {
  fileName?: string;
  fileUrl?: string;
  reportType?: ReportType;
  patientName?: string;
  reportDate?: Date;
  labName?: string | null;
  doctorName?: string | null;
  reportData?: ReportData;
}

export interface IMedicalReportFilters {
  page?: number;
  limit?: number;
  reportType?: ReportType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  userId: string;
}

export interface IPaginatedMedicalReports {
  reports: IMedicalReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

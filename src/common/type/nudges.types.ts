// types/nudge.types.ts
import { NudgeCategory, NudgeUnit, TipType, RiskLevel } from '@prisma/client';

/*
export enum NudgeCategory {
  HYDRATION = 'HYDRATION',
  SLEEP = 'SLEEP', 
  MOVEMENT = 'MOVEMENT',
  WEIGHT = 'WEIGHT',
  OTHER = 'OTHER'
}

export enum NudgeUnit {
  ML = 'ML',
  LITERS = 'LITERS',
  HOURS = 'HOURS',
  MINUTES = 'MINUTES',
  STEPS = 'STEPS',
  KILOMETERS = 'KILOMETERS',
  MILES = 'MILES',
  KG = 'KG',
  POUNDS = 'POUNDS',
  CALORIES = 'CALORIES'
}

export enum TipType {
  LAB_REPORT = 'LAB_REPORT',
  NUDGES = 'NUDGES'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
*/

// Your interfaces remain the same but use Prisma enums
export interface NudgeResponse {
  id: string;
  userId: string;
  title: string;
  category: NudgeCategory;
  targetAmount: number | null;
  consumedAmount: number | null;
  remainingAmount: number | null;
  completed: boolean;
  unit: NudgeUnit | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  tips?: TipResponse[];
}

export interface TipResponse {
  id: string;
  message: string;
  type: TipType;
  riskLevel: RiskLevel;
  createdAt: Date;
}

export interface TodayProgressResponse {
  completed: number;
  total: number;
  percentage: number;
  nudges: NudgeResponse[];
}

export interface NudgeStats {
  totalNudges: number;
  completedNudges: number;
  completionRate: number;
  byCategory: {
    [key in NudgeCategory]: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  count?: number;
}
import { Nudge, NudgeCategory, NudgeUnit, Tip } from '@prisma/client';

export interface NudgeResponse extends Omit<Nudge, 'user' | 'userId'> {
  tips?: Tip[];
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
  byCategory: Record<NudgeCategory, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
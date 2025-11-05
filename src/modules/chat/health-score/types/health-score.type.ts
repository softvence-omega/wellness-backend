// src/chat/health-score/types/health-score.type.ts
export interface HealthScoreItem {
  id: string;
  health_score: number | null;
  analysis: string | null;
  date: Date;           // ← Keep as Date
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthScoreResponse {
  success: true;
  data: {
    userId: string;
    scores: HealthScoreItem[];  // ← Array of Dates
  };
}
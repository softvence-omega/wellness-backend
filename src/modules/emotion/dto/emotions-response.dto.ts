// src/emotions/dto/emotion-response.dto.ts
export class EmotionSummaryDto {
  emoji: string;
  emotion: string;
  count: number;
  percentage: number;
  color: string;
}

export class MostFrequentEmojiDto {
  emoji: string;
  emotion: string;
  count: number;
}

export class EmotionStatsDto {
  totalEntries: number;
  averageIntensity: number;
  mostFrequentEmoji: MostFrequentEmojiDto | null;
  emotionBreakdown: EmotionSummaryDto[];
}

export class UserEmotionsResponseDto {
  emotions: any[]; // You can create a proper EmotionDto for this too
  stats: EmotionStatsDto;
}

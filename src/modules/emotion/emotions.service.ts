// src/emotions/emotions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { EmotionQueryDto } from './dto/emotion-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmotionDto } from './dto/create-emotion-reaction.dto';
import { EmotionStatsDto, EmotionSummaryDto, MostFrequentEmojiDto } from './dto/emotions-response.dto';

interface EmojiCount {
  [emoji: string]: number;
}

interface EmotionSummary {
  emoji: string;
  emotion: string;
  count: number;
  percentage: number;
  color: string;
}

interface DailyCounts {
  [date: string]: number;
}

// Emoji mappings
const EMOJI_MAPPINGS = {
  '😊': { emotion: 'Happy', color: '#F7B125', description: 'Feeling happy' },
  '😂': { emotion: 'Laughing', color: '#F7B125', description: 'Finding something funny' },
  '🥰': { emotion: 'Loved', color: '#F35369', description: 'Feeling loved' },
  '😍': { emotion: 'In Love', color: '#F35369', description: 'Feeling romantic' },
  '🤩': { emotion: 'Excited', color: '#F7B125', description: 'Feeling excited' },
  '😎': { emotion: 'Cool', color: '#1877F2', description: 'Feeling confident' },
  '🥳': { emotion: 'Celebrating', color: '#F7B125', description: 'Celebrating' },
  '😢': { emotion: 'Sad', color: '#1877F2', description: 'Feeling sad' },
  '😭': { emotion: 'Crying', color: '#1877F2', description: 'Very sad' },
  '😔': { emotion: 'Pensive', color: '#1877F2', description: 'Feeling thoughtful' },
  '😠': { emotion: 'Angry', color: '#E9710F', description: 'Feeling angry' },
  '😡': { emotion: 'Furious', color: '#E9710F', description: 'Very angry' },
  '🤯': { emotion: 'Mind-blown', color: '#8B5CF6', description: 'Amazed' },
  '😴': { emotion: 'Sleepy', color: '#1877F2', description: 'Tired' },
  '😋': { emotion: 'Playful', color: '#F7B125', description: 'Feeling playful' },
  '🤢': { emotion: 'Sick', color: '#10B981', description: 'Feeling unwell' },
  '😰': { emotion: 'Anxious', color: '#8B5CF6', description: 'Feeling anxious' },
  '😨': { emotion: 'Scared', color: '#8B5CF6', description: 'Feeling scared' },
  '🤗': { emotion: 'Hugging', color: '#F35369', description: 'Feeling affectionate' },
  '🤔': { emotion: 'Thinking', color: '#6B7280', description: 'Deep in thought' },
  '🙄': { emotion: 'Sarcastic', color: '#6B7280', description: 'Feeling sarcastic' },
  '😏': { emotion: 'Smirking', color: '#6B7280', description: 'Feeling sly' },
  '🔥': { emotion: 'Energetic', color: '#FF6B00', description: 'Full of energy' },
  '🌟': { emotion: 'Amazing', color: '#F7B125', description: 'Feeling amazing' },
  '💪': { emotion: 'Strong', color: '#10B981', description: 'Feeling powerful' },
  '🙏': { emotion: 'Thankful', color: '#10B981', description: 'Feeling grateful' },
  '💔': { emotion: 'Heartbroken', color: '#F35369', description: 'Feeling heartbroken' },
  '❤️': { emotion: 'Love', color: '#F35369', description: 'Feeling loving' }
};

const SUPPORTED_EMOJIS = Object.keys(EMOJI_MAPPINGS);

@Injectable()
export class EmotionsService {
  constructor(private prisma: PrismaService) {}

  private getEmotionFromEmoji(emoji: string) {
    const mapping = EMOJI_MAPPINGS[emoji];
    if (!mapping) {
      throw new BadRequestException(`Emoji ${emoji} is not supported`);
    }
    return mapping.emotion;
  }

  async createEmotion(createEmotionDto: CreateEmotionDto) {

    console.log('createEmotion called - prisma:', this.prisma);
    console.log('createEmotion called - prisma.emotionEntry:', this.prisma?.emotionEntry);
    const { userId, emoji, note, intensity } = createEmotionDto;

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get emotion from emoji
    const emotion = this.getEmotionFromEmoji(emoji);

    // Create emotion entry
    return this.prisma.emotionEntry.create({
      data: {
        userId,
        emoji,
        emotion,
        note,
        intensity,
      },
    });
  }

  async getUserEmotions(userId: string, query: EmotionQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const whereCondition: any = { userId };

    if (query.emoji) {
      whereCondition.emoji = query.emoji;
    }

    if (query.range) {
      const dateFilter = this.getDateFilter(query.range);
      whereCondition.createdAt = dateFilter;
    } else if (query.date) {
      const targetDate = new Date(query.date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      whereCondition.createdAt = {
        gte: targetDate,
        lt: nextDate,
      };
    }

    const emotions = await this.prisma.emotionEntry.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    // Get emotion statistics
    const stats = await this.getEmotionStats(emotions);

    return {
      emotions,
      stats,
    };
  }

private async getEmotionStats(emotions: any[]): Promise<EmotionStatsDto> {
    if (emotions.length === 0) {
      return {
        totalEntries: 0,
        averageIntensity: 0,
        mostFrequentEmoji: null,
        emotionBreakdown: [],
      };
    }

    const emojiCount: Record<string, number> = emotions.reduce((acc, emotion) => {
      acc[emotion.emoji] = (acc[emotion.emoji] || 0) + 1;
      return acc;
    }, {});

    const mostFrequentEmoji = Object.keys(emojiCount).reduce((a, b) =>
      emojiCount[a] > emojiCount[b] ? a : b
    );

    const emotionBreakdown: EmotionSummaryDto[] = Object.entries(emojiCount).map(([emoji, count]) => ({
      emoji,
      emotion: EMOJI_MAPPINGS[emoji]?.emotion || 'Unknown',
      count,
      percentage: Math.round((count / emotions.length) * 100),
      color: EMOJI_MAPPINGS[emoji]?.color || '#6B7280',
    }));

    const averageIntensity = Math.round(
      emotions.reduce((sum, emotion) => sum + emotion.intensity, 0) / emotions.length
    );

    const mostFrequentEmojiDto: MostFrequentEmojiDto = {
      emoji: mostFrequentEmoji,
      emotion: EMOJI_MAPPINGS[mostFrequentEmoji]?.emotion || 'Unknown',
      count: emojiCount[mostFrequentEmoji],
    };

    return {
      totalEntries: emotions.length,
      averageIntensity,
      mostFrequentEmoji: mostFrequentEmojiDto,
      emotionBreakdown: emotionBreakdown.sort((a, b) => b.count - a.count),
    };
  }

  async getEmotionalTrends(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const emotions = await this.prisma.emotionEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        emoji: true,
        emotion: true,
        intensity: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date and calculate daily average mood
    const dailyAverages = emotions.reduce((acc: any, emotion) => {
      const date = emotion.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalIntensity: 0, count: 0, emotions: [] };
      }
      acc[date].totalIntensity += emotion.intensity;
      acc[date].count += 1;
      acc[date].emotions.push(emotion.emoji);
      return acc;
    }, {});

    const trends = Object.entries(dailyAverages).map(([date, data]: [string, any]) => ({
      date,
      averageIntensity: Math.round(data.totalIntensity / data.count),
      dominantEmoji: this.getMostFrequentEmoji(data.emotions),
      entryCount: data.count,
    }));

    return trends;
  }

  private getMostFrequentEmoji(emojis: string[]): string {
    const count = emojis.reduce((acc: EmojiCount, emoji) => {
      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b);
  }

  private getDateFilter(range: string) {
    const filter: any = {};

    switch (range) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filter.gte = today;
        filter.lt = tomorrow;
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filter.gte = weekAgo;
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        filter.gte = monthAgo;
        break;
    }

    return filter;
  }

  async deleteEmotion(id: string) {
    const emotion = await this.prisma.emotionEntry.findUnique({
      where: { id },
    });

    if (!emotion) {
      throw new NotFoundException(`Emotion entry with ID ${id} not found`);
    }

    return this.prisma.emotionEntry.delete({
      where: { id },
    });
  }

  // Get supported emojis for frontend
  getSupportedEmojis() {
    return Object.entries(EMOJI_MAPPINGS).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));
  }
}
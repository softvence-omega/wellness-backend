// src/chat/health-score/health-score.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHealthScoreDto, HealthScoreResponseDto } from './dto/health-score.dto';
import { HealthScoreResponse } from './types/health-score.type';


@Injectable()
export class HealthScoreService {
  constructor(private prisma: PrismaService) {}

  // POST: Save Health Score
  async saveHealthScore(
    userId: string,
    dto: CreateHealthScoreDto,
  ): Promise<HealthScoreResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = {
      userId,
      health_score: dto.health_score ?? null,
      analysis: dto.analysis ?? null,
    };

    if (dto.date) {
      const parsed = new Date(dto.date);
      if (isNaN(parsed.getTime())) throw new BadRequestException('Invalid date');
      data.date = parsed;
    }

    const score = await this.prisma.healthScore.create({ data });

    return {
      success: true,
      data: {
        userId,
        scores: [
      {
        id: score.id,
        health_score: score.health_score,
        analysis: score.analysis,
        date: score.date,                   
        createdAt: score.createdAt,      
        updatedAt: score.updatedAt,        
      },
    ],
      },
    };
  }

  // GET: Get All Health Scores by User
  async getHealthScoresByUser(userId: string): Promise<HealthScoreResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const scores = await this.prisma.healthScore.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        health_score: true,
        analysis: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: {
        userId,
        scores: scores.map(s => ({
          id: s.id,
          health_score: s.health_score,
          analysis: s.analysis,
          date: s.date,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
      },
    };
  }
}
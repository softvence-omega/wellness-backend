import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

import { CreateNudgeDto } from './dto/create-nudge.dto';
import { UpdateNudgeDto } from './dto/update-nudge.dto';
import { UpdateNudgeProgressDto } from './dto/update-nudge-progress.dto';
import { NudgeQueryDto } from './dto/nudge-query.dto';
import { NudgeResponse, TodayProgressResponse, NudgeStats } from './interfaces/nudge.interface';
import { Nudge, NudgeCategory, Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NudgesService {
  private readonly logger = new Logger(NudgesService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNudgeDto: CreateNudgeDto): Promise<NudgeResponse> {
    try {

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!userExists) {
        throw new BadRequestException('User not found');
      }

      this.logger.log(`Creating nudge for user ${userId}`, { 
        category: createNudgeDto.category,
        data: createNudgeDto 
      });

      this.logger.debug('Creating nudge with data:', {
        userId,
        title: createNudgeDto.title,
        category: createNudgeDto.category,
        targetAmount: createNudgeDto.targetAmount,
        unit: createNudgeDto.unit,
        date: createNudgeDto.date
      });

      // Use Prisma's enum types directly
      const nudge = await this.prisma.nudge.create({
        data: {
          userId: userId,
          title: createNudgeDto.title,
          category: createNudgeDto.category as NudgeCategory, // Cast to Prisma enum
          targetAmount: createNudgeDto.targetAmount,
          consumedAmount: 0,
          remainingAmount: createNudgeDto.targetAmount,
          unit: createNudgeDto.unit, // This should match Prisma's NudgeUnit enum
          date: createNudgeDto.date ? new Date(createNudgeDto.date) : new Date(),
          completed: false,
        },
        include: {
          tips: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      this.logger.log(`Nudge created successfully: ${nudge.id}`);
      return this.formatNudgeResponse(nudge);

    } catch (error) {
      this.logger.error('Error creating nudge', { 
        error: error.message,
        stack: error.stack,
        userId, 
        createNudgeDto 
      });
      
      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error('Prisma error details:', {
          code: error.code,
          meta: error.meta,
          message: error.message,
        });
        
        switch (error.code) {
          case 'P2002':
            throw new BadRequestException('Nudge with similar properties already exists');
          case 'P2003':
            throw new BadRequestException('Invalid user reference');
          case 'P2006':
            throw new BadRequestException('Invalid value provided for enum field');
          default:
            throw new BadRequestException(`Database error: ${error.message}`);
        }
      }
      
      // Re-throw if it's already a known exception
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to create nudge: ' + error.message);
    }
  }


  async findAll(userId: string, query: NudgeQueryDto): Promise<NudgeResponse[]> {
    try {
      this.logger.log(`Fetching nudges for user ${userId}`, { query });

      const where: Prisma.NudgeWhereInput = {
        userId,
        isDeleted: false,
      };

      if (query.category) {
        where.category = query.category;
      }

      if (query.completed !== undefined) {
        where.completed = query.completed;
      }

      if (query.date) {
        const targetDate = new Date(query.date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        where.date = {
          gte: targetDate,
          lt: nextDay,
        };
      }

      const include: Prisma.NudgeInclude = {
        tips: {
          orderBy: { createdAt: 'desc' },
        },
      };

      const nudges = await this.prisma.nudge.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Found ${nudges.length} nudges for user ${userId}`);
      return nudges.map(nudge => this.formatNudgeResponse(nudge));
    } catch (error) {
      this.logger.error('Error fetching nudges', { error, userId });
      throw new InternalServerErrorException('Failed to fetch nudges');
    }
  }

  async findOne(id: string, userId: string): Promise<NudgeResponse> {
    try {
      this.logger.log(`Fetching nudge ${id} for user ${userId}`);

      const nudge = await this.prisma.nudge.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        },
        include: {
          tips: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!nudge) {
        this.logger.warn(`Nudge not found: ${id} for user ${userId}`);
        throw new NotFoundException(`Nudge with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched nudge: ${id}`);
      return this.formatNudgeResponse(nudge);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching nudge', { error, id, userId });
      throw new InternalServerErrorException('Failed to fetch nudge');
    }
  }

  async update(id: string, userId: string, updateNudgeDto: UpdateNudgeDto): Promise<NudgeResponse> {
    try {
      this.logger.log(`Updating nudge ${id} for user ${userId}`);

      // First verify the nudge exists and belongs to user
      const existingNudge = await this.prisma.nudge.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        },
      });

      if (!existingNudge) {
        throw new NotFoundException(`Nudge with ID ${id} not found`);
      }

      const updateData: Prisma.NudgeUpdateInput = { ...updateNudgeDto };

      // Recalculate remaining amount if target amount changes
      if (updateNudgeDto.targetAmount !== undefined) {
        const consumedAmount = existingNudge.consumedAmount || 0;
        updateData.remainingAmount = Math.max(0, updateNudgeDto.targetAmount - consumedAmount);
        updateData.completed = (updateData.remainingAmount as number) <= 0;
      }

      const updatedNudge = await this.prisma.nudge.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          tips: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      this.logger.log(`Nudge updated successfully: ${id}`);
      return this.formatNudgeResponse(updatedNudge);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Nudge with ID ${id} not found`);
        }
      }
      
      this.logger.error('Error updating nudge', { error, id, userId });
      throw new InternalServerErrorException('Failed to update nudge');
    }
  }

  async updateProgress(
    id: string,
    userId: string,
    updateNudgeProgressDto: UpdateNudgeProgressDto,
  ): Promise<NudgeResponse> {
    try {
      this.logger.log(`Updating progress for nudge ${id}`, {
        userId,
        consumedAmount: updateNudgeProgressDto.consumedAmount,
      });

      const existingNudge = await this.prisma.nudge.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        },
      });

      if (!existingNudge) {
        throw new NotFoundException(`Nudge with ID ${id} not found`);
      }

      const targetAmount = existingNudge.targetAmount || 0;
      const consumedAmount = updateNudgeProgressDto.consumedAmount;
      const remainingAmount = Math.max(0, targetAmount - consumedAmount);
      const completed =
        updateNudgeProgressDto.completed !== undefined
          ? updateNudgeProgressDto.completed
          : remainingAmount <= 0;

      const updatedNudge = await this.prisma.nudge.update({
        where: { id },
        data: {
          consumedAmount,
          remainingAmount,
          completed,
          updatedAt: new Date(),
        },
        include: {
          tips: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      this.logger.log(`Nudge progress updated successfully: ${id}`);
      return this.formatNudgeResponse(updatedNudge);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Nudge with ID ${id} not found`);
        }
      }
      
      this.logger.error('Error updating nudge progress', { error, id, userId });
      throw new InternalServerErrorException('Failed to update nudge progress');
    }
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Soft deleting nudge ${id} for user ${userId}`);

      const existingNudge = await this.prisma.nudge.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        },
      });

      if (!existingNudge) {
        throw new NotFoundException(`Nudge with ID ${id} not found`);
      }

      await this.prisma.nudge.update({
        where: { id },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Nudge soft deleted successfully: ${id}`);
      return { message: 'Nudge deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Nudge with ID ${id} not found`);
        }
      }
      
      this.logger.error('Error deleting nudge', { error, id, userId });
      throw new InternalServerErrorException('Failed to delete nudge');
    }
  }

  async getTodayProgress(userId: string): Promise<TodayProgressResponse> {
    try {
      this.logger.log(`Fetching today's progress for user ${userId}`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nudges = await this.prisma.nudge.findMany({
        where: {
          userId,
          date: {
            gte: today,
            lt: tomorrow,
          },
          isDeleted: false,
        },
        include: {
          tips: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      const completed = nudges.filter(nudge => nudge.completed).length;
      const total = nudges.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      const response: TodayProgressResponse = {
        completed,
        total,
        percentage,
        nudges: nudges.map(nudge => this.formatNudgeResponse(nudge)),
      };

      this.logger.log(`Today's progress fetched for user ${userId}`, {
        completed,
        total,
        percentage,
      });

      return response;
    } catch (error) {
      this.logger.error('Error fetching today progress', { error, userId });
      throw new InternalServerErrorException('Failed to fetch today progress');
    }
  }

  async getStats(userId: string): Promise<NudgeStats> {
    try {
      this.logger.log(`Fetching nudge stats for user ${userId}`);

      const nudges = await this.prisma.nudge.findMany({
        where: {
          userId,
          isDeleted: false,
        },
      });

      const totalNudges = nudges.length;
      const completedNudges = nudges.filter(nudge => nudge.completed).length;
      const completionRate = totalNudges > 0 ? Math.round((completedNudges / totalNudges) * 100) : 0;

      const byCategory = {
        [NudgeCategory.HYDRATION]: nudges.filter(n => n.category === NudgeCategory.HYDRATION).length,
        [NudgeCategory.SLEEP]: nudges.filter(n => n.category === NudgeCategory.SLEEP).length,
        [NudgeCategory.MOVEMENT]: nudges.filter(n => n.category === NudgeCategory.MOVEMENT).length,
        [NudgeCategory.WEIGHT]: nudges.filter(n => n.category === NudgeCategory.WEIGHT).length,
        [NudgeCategory.OTHER]: nudges.filter(n => n.category === NudgeCategory.OTHER).length,
      };

      const stats: NudgeStats = {
        totalNudges,
        completedNudges,
        completionRate,
        byCategory,
      };

      this.logger.log(`Nudge stats fetched for user ${userId}`, { stats });
      return stats;
    } catch (error) {
      this.logger.error('Error fetching nudge stats', { error, userId });
      throw new InternalServerErrorException('Failed to fetch nudge stats');
    }
  }

  private formatNudgeResponse(nudge: Nudge & { tips?: any[] }): NudgeResponse {
    const { userId, ...nudgeData } = nudge;
    return nudgeData;
  }
}
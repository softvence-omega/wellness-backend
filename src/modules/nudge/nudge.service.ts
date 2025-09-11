import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNudgeDto } from './dto/create-nudge.dto';
import { UpdateNudgeDto } from './dto/update-nudge.dto';

@Injectable()
export class NudgeService {
  constructor(private prisma: PrismaService) {}

  // Create Nudge
  async create(userId: number, dto: CreateNudgeDto) {
    return this.prisma.nudge.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  // Get all Nudges with pagination (only non-deleted)
  async findAll(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.nudge.findMany({
        where: { userId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.nudge.count({ where: { userId, isDeleted: false } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // Get single Nudge (only if not deleted)
  async findOne(id: number, userId: number) {
    const nudge = await this.prisma.nudge.findFirst({
      where: { id, userId, isDeleted: false },
    });
    if (!nudge) throw new NotFoundException('Nudge not found');
    return nudge;
  }

  // Update Nudge
  async update(id: number, userId: number, dto: UpdateNudgeDto) {
    const nudge = await this.prisma.nudge.findFirst({
      where: { id, userId, isDeleted: false },
    });
    if (!nudge) throw new NotFoundException('Nudge not found');

    return this.prisma.nudge.update({
      where: { id },
      data: { ...dto },
    });
  }

  // Soft Delete Nudge
  async remove(id: number, userId: number) {
    const nudge = await this.prisma.nudge.findFirst({
      where: { id, userId, isDeleted: false },
    });
    if (!nudge) throw new NotFoundException('Nudge not found');

    return this.prisma.nudge.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

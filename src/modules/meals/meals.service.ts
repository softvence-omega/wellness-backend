import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal-dto';
import { UpdateMealDto } from './dto/update-meal-dto';
import { MealType, Prisma } from '@prisma/client';
import { CustomLogger } from 'src/logger/logger.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class MealService {
  private readonly logger = new CustomLogger();

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Create Meal
  async create(userId: string, dto: CreateMealDto, file?: Express.Multer.File) {
    const context = 'MealService.create';

    // Validate required fields
    if (!dto.name?.trim() || !dto.mealType) {
      this.logger.warn('Missing required fields', context, { userId, dto });
      throw new BadRequestException('Name and mealType are required');
    }

    // Validate mealType enum
    if (!Object.values(MealType).includes(dto.mealType)) {
      this.logger.warn('Invalid meal type', context, {
        userId,
        mealType: dto.mealType,
      });
      throw new BadRequestException(
        `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`,
      );
    }

    try {
      // Parse time with validation
      let time: Date | undefined;
      if (dto.time) {
        time = new Date(dto.time);
        if (isNaN(time.getTime())) {
          this.logger.warn('Invalid time format', context, { time: dto.time });
          throw new BadRequestException('Invalid time format');
        }
      }

      // Upload file to Cloudinary if provided
      let photoUrl: string | undefined;
      if (file) {
        photoUrl = await this.cloudinaryService.uploadImage(file);
      }

      const mealData: Prisma.MealCreateInput = {
        name: dto.name.trim(),
        mealType: dto.mealType,
        description: dto.description?.trim(),
        note: dto.note?.trim(),
        photo: photoUrl || dto.photo?.trim(), // Use uploaded file or existing URL
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fats: dto.fats,
        time,
        user: { connect: { id: userId } },
        isDeleted: false,
        isCompleted: false,
      };

      this.logger.debug('Creating meal', context, { userId, mealData });

      const meal = await this.prisma.meal.create({
        data: mealData,
        select: this.getMealSelectFields(),
      });

      this.logger.log('Meal created successfully', context, {
        mealId: meal.id,
        userId,
        mealType: meal.mealType,
        hasPhoto: !!photoUrl,
      });

      return meal;
    } catch (error) {
      this.logger.error('Failed to create meal', error.stack, context, {
        userId,
        dto,
        error: error.message,
      });

      if (error instanceof BadRequestException) throw error;
      if (error.code === 'P2002') {
        throw new BadRequestException('Meal with similar data already exists');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('User not found');
      }

      throw new BadRequestException('Failed to create meal');
    }
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    mealType?: MealType,
    date?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const context = 'MealService.findAll';

    const validatedPage = Math.max(1, Math.floor(page));
    const validatedLimit = Math.max(1, Math.min(Math.floor(limit), 100));
    const skip = (validatedPage - 1) * validatedLimit;

    const where: Prisma.MealWhereInput = {
      userId,
      isDeleted: false,
    };

    if (mealType) {
      if (!Object.values(MealType).includes(mealType)) {
        this.logger.warn('Invalid meal type in filter', context, {
          userId,
          mealType,
        });
        throw new BadRequestException(
          `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`,
        );
      }
      where.mealType = mealType;
    }

    if (date) {
      const startDate = new Date(date);
      if (isNaN(startDate.getTime())) {
        this.logger.warn('Invalid date format', context, { userId, date });
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      where.time = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Add date range filtering
    if (startDate || endDate) {
      where.time = {};

      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          this.logger.warn('Invalid startDate format', context, {
            userId,
            startDate,
          });
          throw new BadRequestException(
            'Invalid startDate format. Use YYYY-MM-DD',
          );
        }
        start.setHours(0, 0, 0, 0);
        where.time.gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          this.logger.warn('Invalid endDate format', context, {
            userId,
            endDate,
          });
          throw new BadRequestException(
            'Invalid endDate format. Use YYYY-MM-DD',
          );
        }
        end.setHours(23, 59, 59, 999);
        where.time.lte = end;
      }
    }

    try {
      this.logger.debug('Fetching meals with filters', context, {
        userId,
        page: validatedPage,
        limit: validatedLimit,
        mealType,
        date,
        startDate,
        endDate,
      });

      const [data, total] = await Promise.all([
        this.prisma.meal.findMany({
          where,
          skip,
          take: validatedLimit,
          orderBy: { time: 'desc' },
          select: this.getMealSelectFields(),
        }),
        this.prisma.meal.count({ where }),
      ]);

      const lastPage = Math.ceil(total / validatedLimit) || 1;

      this.logger.log('Meals fetched successfully', context, {
        userId,
        total,
        returned: data.length,
        page: validatedPage,
        lastPage,
      });

      return {
        data,
        meta: {
          total,
          page: validatedPage,
          limit: validatedLimit,
          lastPage,
          hasNextPage: validatedPage < lastPage,
          hasPrevPage: validatedPage > 1,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch meals', error.stack, context, {
        userId,
        error: error.message,
        page,
        limit,
        mealType,
        date,
      });
      throw new BadRequestException('Failed to fetch meals');
    }
  }

  // Get single Meal
  async findOne(id: string, userId: string) {
    const context = 'MealService.findOne';

    if (!id?.trim()) {
      this.logger.warn('Invalid meal ID', context, { userId, mealId: id });
      throw new BadRequestException('Invalid meal ID');
    }

    try {
      this.logger.debug('Fetching single meal', context, {
        userId,
        mealId: id,
      });

      const meal = await this.prisma.meal.findFirst({
        where: {
          id: id.trim(),
          userId,
          isDeleted: false,
        },
        select: this.getMealSelectFields(),
      });

      if (!meal) {
        this.logger.warn('Meal not found', context, { userId, mealId: id });
        throw new NotFoundException('Meal not found');
      }

      this.logger.log('Meal fetched successfully', context, {
        userId,
        mealId: id,
        mealType: meal.mealType,
      });

      return meal;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Failed to fetch meal', error.stack, context, {
        userId,
        mealId: id,
        error: error.message,
      });
      throw new BadRequestException('Failed to fetch meal');
    }
  }

  // Update Meal
  async update(
    id: string,
    userId: string,
    dto: UpdateMealDto,
    file?: Express.Multer.File,
  ) {
    const context = 'MealService.update';

    if (!id?.trim()) {
      this.logger.warn('Invalid meal ID for update', context, {
        userId,
        mealId: id,
      });
      throw new BadRequestException('Invalid meal ID');
    }

    // Validate that at least one field is provided
    if (Object.keys(dto).length === 0 && !file) {
      this.logger.warn('No fields provided for update', context, {
        userId,
        mealId: id,
      });
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    try {
      this.logger.debug('Verifying meal exists for update', context, {
        userId,
        mealId: id,
      });

      const existingMeal = await this.prisma.meal.findFirst({
        where: {
          id: id.trim(),
          userId,
          isDeleted: false,
        },
      });

      if (!existingMeal) {
        this.logger.warn('Meal not found for update', context, {
          userId,
          mealId: id,
        });
        throw new NotFoundException('Meal not found');
      }

      // Upload new file to Cloudinary if provided
      let photoUrl: string | undefined;
      if (file) {
        // Delete old photo if exists
        if (existingMeal.photo) {
          try {
            const publicId = this.cloudinaryService.extractPublicId(
              existingMeal.photo,
            );
            if (publicId) {
              await this.cloudinaryService.deleteFile(publicId);
            }
          } catch (error) {
            this.logger.warn(
              'Failed to delete old photo, continuing with upload',
              context,
              {
                mealId: id,
                error: error.message,
              },
            );
          }
        }

        photoUrl = await this.cloudinaryService.uploadImage(file);
      }

      // Prepare update data
      const updateData: Prisma.MealUpdateInput = {};

      if (dto.name !== undefined) {
        if (!dto.name.trim()) {
          this.logger.warn('Empty name provided for update', context, {
            userId,
            mealId: id,
          });
          throw new BadRequestException('Name cannot be empty');
        }
        updateData.name = dto.name.trim();
      }

      if (dto.mealType !== undefined) {
        if (!Object.values(MealType).includes(dto.mealType)) {
          this.logger.warn('Invalid meal type for update', context, {
            userId,
            mealId: id,
            mealType: dto.mealType,
          });
          throw new BadRequestException(
            `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`,
          );
        }
        updateData.mealType = dto.mealType;
      }

      if (dto.description !== undefined) {
        updateData.description = dto.description?.trim() || null;
      }

      if (dto.note !== undefined) {
        updateData.note = dto.note?.trim() || null;
      }

      if (photoUrl !== undefined) {
        updateData.photo = photoUrl;
      } else if (dto.photo !== undefined) {
        updateData.photo = dto.photo?.trim() || null;
      }

      if (dto.calories !== undefined) updateData.calories = dto.calories;
      if (dto.protein !== undefined) updateData.protein = dto.protein;
      if (dto.carbs !== undefined) updateData.carbs = dto.carbs;
      if (dto.fats !== undefined) updateData.fats = dto.fats;
      if (dto.isCompleted !== undefined)
        updateData.isCompleted = dto.isCompleted;

      if (dto.time !== undefined) {
        if (dto.time === null) {
          updateData.time = null;
        } else if (dto.time) {
          const time = new Date(dto.time);
          if (isNaN(time.getTime())) {
            this.logger.warn('Invalid time format for update', context, {
              userId,
              mealId: id,
              time: dto.time,
            });
            throw new BadRequestException('Invalid time format');
          }
          updateData.time = time;
        }
      }

      this.logger.debug('Updating meal', context, {
        userId,
        mealId: id,
        updateData,
      });

      const updatedMeal = await this.prisma.meal.update({
        where: { id: id.trim() },
        data: updateData,
        select: this.getMealSelectFields(),
      });

      this.logger.log('Meal updated successfully', context, {
        userId,
        mealId: id,
        updatedFields: Object.keys(dto),
        hasNewPhoto: !!file,
      });

      return updatedMeal;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Failed to update meal', error.stack, context, {
        userId,
        mealId: id,
        error: error.message,
      });

      if (error.code === 'P2025') {
        throw new NotFoundException('Meal not found');
      }

      throw new BadRequestException('Failed to update meal');
    }
  }

  // Soft Delete Meal
  async remove(id: string, userId: string) {
    const context = 'MealService.remove';

    if (!id?.trim()) {
      this.logger.warn('Invalid meal ID for deletion', context, {
        userId,
        mealId: id,
      });
      throw new BadRequestException('Invalid meal ID');
    }

    try {
      this.logger.debug('Verifying meal exists for deletion', context, {
        userId,
        mealId: id,
      });

      const existingMeal = await this.prisma.meal.findFirst({
        where: {
          id: id.trim(),
          userId,
          isDeleted: false,
        },
      });

      if (!existingMeal) {
        this.logger.warn('Meal not found for deletion', context, {
          userId,
          mealId: id,
        });
        throw new NotFoundException('Meal not found');
      }

      // Delete photo from Cloudinary if exists
      if (existingMeal.photo) {
        try {
          const publicId = this.cloudinaryService.extractPublicId(
            existingMeal.photo,
          );
          if (publicId) {
            await this.cloudinaryService.deleteFile(publicId);
          }
        } catch (error) {
          this.logger.warn(
            'Failed to delete photo from Cloudinary, continuing with soft delete',
            context,
            {
              mealId: id,
              error: error.message,
            },
          );
        }
      }

      const deletedMeal = await this.prisma.meal.update({
        where: { id: id.trim() },
        data: { isDeleted: true },
        select: this.getMealSelectFields(),
      });

      this.logger.log('Meal soft-deleted successfully', context, {
        userId,
        mealId: id,
      });

      return deletedMeal;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Failed to delete meal', error.stack, context, {
        userId,
        mealId: id,
        error: error.message,
      });

      if (error.code === 'P2025') {
        throw new NotFoundException('Meal not found');
      }

      throw new BadRequestException('Failed to delete meal');
    }
  }

  // Get meal statistics
  async getMealStats(userId: string, startDate?: string, endDate?: string) {
    const context = 'MealService.getMealStats';

    const where: Prisma.MealWhereInput = {
      userId,
      isDeleted: false,
    };

    // Filter by date range
    if (startDate || endDate) {
      where.time = {};

      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          this.logger.warn('Invalid startDate for stats', context, {
            userId,
            startDate,
          });
          throw new BadRequestException(
            'Invalid startDate format. Use YYYY-MM-DD',
          );
        }
        start.setHours(0, 0, 0, 0);
        where.time.gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          this.logger.warn('Invalid endDate for stats', context, {
            userId,
            endDate,
          });
          throw new BadRequestException(
            'Invalid endDate format. Use YYYY-MM-DD',
          );
        }
        end.setHours(23, 59, 59, 999);
        where.time.lte = end;
      }
    }

    try {
      this.logger.debug('Fetching meal statistics', context, {
        userId,
        startDate,
        endDate,
      });

      const meals = await this.prisma.meal.findMany({
        where,
        select: {
          mealType: true,
          calories: true,
          protein: true,
          carbs: true,
          fats: true,
          time: true,
        },
        orderBy: { time: 'asc' },
      });

      // Calculate statistics
      const stats = {
        totalMeals: meals.length,
        totalCalories: meals.reduce(
          (sum, meal) => sum + (meal.calories || 0),
          0,
        ),
        totalProtein: meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
        totalCarbs: meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
        totalFats: meals.reduce((sum, meal) => sum + (meal.fats || 0), 0),
        mealsByType: {} as Record<MealType, number>,
        averageCalories: 0,
      };

      // Count meals by type
      meals.forEach((meal) => {
        if (!meal.mealType) return;
        stats.mealsByType[meal.mealType] =
          (stats.mealsByType[meal.mealType] || 0) + 1;
      });

      // Calculate averages
      stats.averageCalories =
        stats.totalMeals > 0 ? stats.totalCalories / stats.totalMeals : 0;

      this.logger.log('Meal statistics fetched successfully', context, {
        userId,
        totalMeals: stats.totalMeals,
        dateRange: { startDate, endDate },
      });

      return stats;
    } catch (error) {
      this.logger.error('Failed to fetch meal stats', error.stack, context, {
        userId,
        error: error.message,
        startDate,
        endDate,
      });
      throw new BadRequestException('Failed to fetch meal statistics');
    }
  }

  // Helper method to consistently select fields
  private getMealSelectFields(): Prisma.MealSelect {
    return {
      id: true,
      name: true,
      description: true,
      note: true,
      photo: true,
      mealType: true,
      calories: true,
      protein: true,
      carbs: true,
      fats: true,
      time: true,
      isCompleted: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    };
  }
}

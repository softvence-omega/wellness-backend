import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { successResponse } from 'src/common/response';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { CreateMealDto } from './dto/create-meal-dto';
import { MealService } from './meals.service';
import { UpdateMealDto } from './dto/update-meal-dto';
import { MealType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ToggleMealDto } from './dto/toggle-meal.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meals') // Changed to plural for REST conventions
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Roles('ADMIN', 'USER')
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  async create(
    @Req() req: any,
    @Body() dto: CreateMealDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    const result = await this.mealService.create(userId, dto, file);
    return successResponse(result, 'Meal created successfully');
  }

  @Roles('ADMIN', 'USER')
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('mealType') mealType?: MealType,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.userId;
    const result = await this.mealService.findAll(
      userId,
      page,
      limit,
      mealType,
      date,
      startDate,
      endDate,
    );
    return successResponse(result, 'Meals fetched successfully');
  }

  // Get Meal Statistics - NEW endpoint
  @Roles('ADMIN', 'USER')
  @Get('stats')
  async getStats(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.userId;
    const result = await this.mealService.getMealStats(
      userId,
      startDate,
      endDate,
    );
    return successResponse(result, 'Meal statistics fetched successfully');
  }

  // Get single Meal - RESTful: GET /meals/:id
  @Roles('ADMIN', 'USER')
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const result = await this.mealService.findOne(id, userId);
    return successResponse(result, 'Meal fetched successfully');
  }

  // Update Meal - RESTful: PUT /meals/:id
  @Roles('ADMIN', 'USER')
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    const result = await this.mealService.update(id, userId, dto, file);
    return successResponse(result, 'Meal updated successfully');
  }

  // Soft Delete Meal - RESTful: DELETE /meals/:id
  @Roles('ADMIN', 'USER')
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const result = await this.mealService.remove(id, userId);
    return successResponse(result, 'Meal deleted successfully');
  }

  @Roles('ADMIN', 'USER')
  @Get('diary')
  async getDiary(@Req() req: any, @Query('date') date?: string) {
    const userId = req.user.userId;
    const result = await this.mealService.findDiary(userId, date);
    return successResponse(result, 'Food diary fetched');
  }

  @Roles('ADMIN', 'USER')
  @Patch(':id/toggle')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async toggle(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ToggleMealDto,
  ) {
    const userId = req.user.userId;
    const result = await this.mealService.toggleCompleted(id, userId, dto);
    return successResponse(result, 'Meal status toggled');
  }
}

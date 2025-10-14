// import {
//     Body,
//     Controller,
//     Delete,
//     Get,
//     Param,
//     Post,
//     Put,
//     Query,
//     Req,
//     UseGuards,
// } from '@nestjs/common';
// import { successResponse } from 'src/common/response';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/role-auth.guard';
// import { CreateMealDto } from './dto/create-meal-dto';
// import { MealService } from './meals.service';
// import { UpdateMealDto } from './dto/update-meal-dto';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('meal')
// export class MealController {
//     constructor(private readonly mealService: MealService) { }

//     // Create Meal
//     @Roles('ADMIN', 'USER')
//     @Post('create-meal')
//     async create(@Req() req: any, @Body() dto: CreateMealDto) {
//         const userId = req.user.userId;
//         const result = await this.mealService.create(userId, dto);
//         return successResponse(result, 'Meal created successfully');
//     }

//     // Get All Meals with pagination
//     @Roles('ADMIN', 'USER')
//     @Get('get-all-meal')
//     async findAll(
//         @Req() req: any,
//         @Query('page') page = 1,
//         @Query('limit') limit = 10,
//         @Query('mealType') mealType?: string, //optional
//         @Query('date') date? : string         // optional, ISO string
//     ) {
//         const userId = req.user.userId;
//         const result = await this.mealService.findAll(userId, Number(page), Number(limit), mealType, date);
//         return successResponse(result, 'Meals fetched successfully');
//     }

//     // Get single Meal
//     @Roles('ADMIN', 'USER')
//     @Get(':id')
//     async findOne(@Req() req: any, @Param('id') id: string) {
//         const userId = req.user.userId;
//         const result = await this.mealService.findOne(Number(id), userId);
//         return successResponse(result, 'Meal fetched successfully');
//     }

//     // Update Meal
//     @Roles('ADMIN', 'USER')
//     @Put(':id')
//     async update(
//         @Req() req: any,
//         @Param('id') id: string,
//         @Body() dto: UpdateMealDto,
//     ) {
//         const userId = req.user.userId;
//         const result = await this.mealService.update(Number(id), userId, dto);
//         return successResponse(result, 'Meal updated successfully');
//     }

//     // Delete Meal (hard delete)
//     @Roles('ADMIN', 'USER')
//     @Delete(':id')
//     async remove(@Req() req: any, @Param('id') id: string) {
//         const userId = req.user.userId;
//         const result = await this.mealService.remove(Number(id), userId);
//         return successResponse(result, 'Meal deleted successfully');
//     }
// }

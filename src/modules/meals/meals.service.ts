// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateMealDto } from './dto/create-meal-dto';
// import { UpdateMealDto } from './dto/update-meal-dto';

// @Injectable()
// export class MealService {
//     constructor(private prisma: PrismaService) { }

//     // Create Meal
//     async create(userId: number, dto: CreateMealDto) {
//         return this.prisma.meal.create({
//             data: {
//                 ...dto,
//                 userId,
//                 isDeleted: false, // ensure default false
//             },
//         });
//     }

//     // Get all Meals with pagination (only for given user & not deleted)
//     async findAll(userId: number, page = 1, limit = 10, mealType?: string, date?: string) {
//         const skip = (page - 1) * limit;

//         const where: any = {
//             userId,
//             isDeleted: false,
//         }
//         if (mealType) {
//             where.mealType = mealType; // filter by mealtype
//         }

//         if (date) {
//             //filter by date (matching createdAt date only)
//             const start = new Date(date);
//             start.setHours(0, 0, 0, 0);
//             const end = new Date(date);
//             end.setHours(23, 59, 59, 999)

//             where.createdAt = {
//                 gte: start,
//                 lte: end,
//             }
//         }

//         const [data, total] = await Promise.all([
//             this.prisma.meal.findMany({
//                 where,
//                 skip,
//                 take: limit,
//                 orderBy: { createdAt: 'desc' },
//             }),
//             this.prisma.meal.count({ where: { userId, isDeleted: false } }),
//         ]);

//         return {
//             data,
//             meta: {
//                 total,
//                 page,
//                 lastPage: Math.ceil(total / limit),
//             },
//         };
//     }

//     // Get single Meal (must belong to user & not deleted)
//     async findOne(id: number, userId: number) {
//         const meal = await this.prisma.meal.findFirst({
//             where: { id, userId, isDeleted: false },
//         });
//         if (!meal) throw new NotFoundException('Meal not found');
//         return meal;
//     }

//     // Update Meal (must belong to user & not deleted)
//     async update(id: number, userId: number, dto: UpdateMealDto) {
//         const meal = await this.prisma.meal.findFirst({
//             where: { id, userId, isDeleted: false },
//         });
//         if (!meal) throw new NotFoundException('Meal not found');

//         return this.prisma.meal.update({
//             where: { id },
//             data: { ...dto },
//         });
//     }

//     // Soft Delete Meal (mark isDeleted: true)
//     async remove(id: number, userId: number) {
//         const meal = await this.prisma.meal.findFirst({
//             where: { id, userId, isDeleted: false },
//         });
//         if (!meal) throw new NotFoundException('Meal not found');

//         return this.prisma.meal.update({
//             where: { id },
//             data: { isDeleted: true },
//         });
//     }
// }

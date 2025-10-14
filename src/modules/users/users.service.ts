// import {
//   BadRequestException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { UpdateProfileDto } from './dto/user-update.dto';
// import { Prisma } from '@prisma/client';
// import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

// @Injectable()
// export class UsersService {
//   constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) { }

//   // ✅ Update profile
//   async profileUpdate(dto: UpdateProfileDto, userId: number) {
//     const isUserExist = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!isUserExist) throw new NotFoundException('User not found!');
//     if (isUserExist.isDeleted) throw new NotFoundException('User already deleted!');

//     const updateProfile = await this.prisma.profile.update({
//       where: { userId },
//       data: {
//         fullName: dto.fullName,
//         dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
//         gender: dto.gender,
//         height: dto.height,
//         weight: dto.weight,
//         healthGoal: dto.healthGoal,
//         photo: dto.photo,
//         language: dto.language,
//         isEnableNotification: dto.isEnableNotification,
//       },
//     });

//     return updateProfile;
//   }

//  async uploadFile(file: Express.Multer.File, userId: number) {
//     let fileUrl = '';

//     //  Upload image to Cloudinary
//     if (file) {
//       const uploadResult = await this.cloudinary.uploadBuffer(
//         file.buffer,
//         'photo/fileUrl',
//         'image',
//       );
//       fileUrl = uploadResult.secure_url;
//     }

//     // ✅ Check if user exists
//     const isUserExist = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });
//     if (!isUserExist) throw new NotFoundException('User not found!');
//     if (isUserExist.isDeleted)
//       throw new NotFoundException('User already deleted!');

//     // ✅ Update profile photo
//     const updatedProfile = await this.prisma.profile.update({
//       where: { userId },
//       data: { photo: fileUrl },
//     });

//     return updatedProfile;
//   }

//   // ✅ List all users
//   async findAll(
//     page = 1,
//     limit = 10,
//     searchTerm?: string,
//     order: 'asc' | 'desc' = 'desc',
//     filters?: { [key: string]: any },
//   ) {
//     try {
//       const skip = (page - 1) * limit;

//       console.log(page, limit)

//       const searchFilter: Prisma.UserWhereInput = searchTerm
//         ? {
//           OR: [
//             { profile: { fullName: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } } },
//             { email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
//           ],
//         }
//         : {};

//       const where: Prisma.UserWhereInput = {
//         ...filters,
//         ...searchFilter,
//         isDeleted: false,
//       };

//       const [users, total] = await Promise.all([
//         this.prisma.user.findMany({
//           skip,
//           take: limit,
//           where,
//           orderBy: { createdAt: order },
//           include: { profile: true },
//         }),
//         this.prisma.user.count({ where }),
//       ]);

//       return {
//         data: users.map(({ password, ...u }) => u),
//         meta: {
//           total,
//           page,
//           lastPage: Math.ceil(total / limit),
//         },
//       };
//     } catch (error) {
//       console.log(error)
//       throw new InternalServerErrorException('Failed to fetch users.');
//     }
//   }

//   // ✅ Get single user
//   async findOne(id: number) {
//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id },
//         include: { profile: true },
//       });

//       if (!user) throw new NotFoundException('User not found');
//       if (user.isDeleted) throw new NotFoundException('User already deleted!');

//       const { password, ...safeUser } = user;
//       return safeUser;
//     } catch (error) {
//       if (error instanceof NotFoundException) throw error;
//       throw new InternalServerErrorException('Failed to fetch user');
//     }
//   }

//   // ✅ Soft delete
//   async remove(id: number) {
//     const existingUser = await this.prisma.user.findUnique({ where: { id } });

//     if (!existingUser) throw new NotFoundException('User not found');
//     if (existingUser.isDeleted) throw new BadRequestException('User is already deleted');

//     const deletedUser = await this.prisma.user.update({
//       where: { id },
//       data: { isDeleted: true },
//     });

//     const { password, ...safeUser } = deletedUser;
//     return safeUser;
//   }
// }

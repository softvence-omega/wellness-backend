import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/user-update.dto';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { notificationSettings: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const settings = await this.prisma.notificationSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });

    return settings;
  }

  async profileUpdate(
    dto: UpdateProfileDto,
    userId: string,
    file: Express.Multer.File,
  ) {
    const isUserExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) throw new NotFoundException('User not found!');
    if (isUserExist.isDeleted)
      throw new NotFoundException('User already deleted!');

    let fileUrl: string | undefined;
    if (file) {
      const uploadResult = await this.cloudinary.uploadBuffer(
        file.buffer,
        'photo/fileUrl',
        'image',
      );
      fileUrl = uploadResult.secure_url;
    }

     if(dto.fcmToken){
           await this.prisma.user.update({
        where: { id: isUserExist.id },
        data: { fcmtoken : dto.fcmToken }, 
      });

     }
    const updateProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        height: dto.height ? parseFloat(dto.height) : undefined,
        weight: dto.weight ? parseFloat(dto.weight) : undefined,
        healthGoal: dto.healthGoal,
        language: dto.language,
        isEnableNotification: dto.isEnableNotification,
        photo: fileUrl,
        
      },
    });

    console.log(updateProfile);

    return updateProfile;
  }

  async findAll(
    page = 1,
    limit = 10,
    searchTerm?: string,
    order: 'asc' | 'desc' = 'desc',
    filters?: { [key: string]: any },
  ) {
    try {
      const skip = (page - 1) * limit;

      console.log(page, limit);

      const searchFilter: Prisma.UserWhereInput = searchTerm
        ? {
            OR: [
              {
                profile: {
                  fullName: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
              {
                email: {
                  contains: searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {};

      const where: Prisma.UserWhereInput = {
        ...filters,
        ...searchFilter,
        isDeleted: false,
      };

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: order },
          include: { profile: true },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users.map(({ ...u }) => u),
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch users.');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { profile: true, notificationSettings: true },
      });

      if (!user) throw new NotFoundException('User not found');
      if (user.isDeleted) throw new NotFoundException('User already deleted!');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) throw new NotFoundException('User not found');
    if (existingUser.isDeleted)
      throw new BadRequestException('User is already deleted');

    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = deletedUser;
    return safeUser;
  }
}

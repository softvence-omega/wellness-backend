import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/user-update.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async profileUpdate(dto: UpdateProfileDto, userId: any) {
        const isUserExist = await this.prisma.user.findUnique({ where: { id: userId } })
        if (!isUserExist) {
            throw new NotFoundException("User not found!")
        }

        if (isUserExist.isDeleted === true) {
            throw new NotFoundException("User already deleted")
        }

        const updateProfile = await this.prisma.profile.update({
            where: { userId },
            data: {
                fullName: dto.fullName,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                gender: dto.gender,
                height: dto.height,
                healthGoal: dto.healthGoal,
                photo: dto.photo
            }
        })

        return updateProfile

    }
}

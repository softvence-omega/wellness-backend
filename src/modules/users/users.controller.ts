import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { successResponse } from 'src/common/response';
import { UpdateProfileDto } from './dto/user-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles('ADMIN', 'USER')
  @Put('profile')
  async userProfileUpdate(
    @Body() dto: UpdateProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const result = await this.userService.profileUpdate(dto, req.user.userId);
    return successResponse(result, 'User profile updated successfully.');
  }

  @Roles('ADMIN', 'USER')
  @Put('profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    console.log('user id ', userId);
    if (!userId) {
      throw new BadRequestException('No User id.');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded. Please provide a file.');
    }

    const data = await this.userService.uploadFile(file, userId);
    return successResponse(data, 'Profile photo updated successfully');
  }

  @Get('user-list')
  @Roles('ADMIN')
  async findAll(@Query() query: Record<string, any>) {
    // page, limit, search, order remove from query to get actual filters
    const { page = 1, limit = 10, search, order = 'desc', ...filters } = query;

    const data = await this.userService.findAll(
      Number(page),
      Number(limit),
      search as string | undefined,
      order as 'asc' | 'desc',
      filters,
    );
    return successResponse(data, 'Users fetched');
  }

  @Get('me')
  @Roles('ADMIN', 'USER')
  async findOne(@Req() req: AuthenticatedRequest) {
    const id = req.user?.userId;
    if (!id) {
      throw new BadRequestException('User not found');
    }
    const data = await this.userService.findOne(id);
    return successResponse(data, 'User fetched');
  }

  @Delete('users/:id')
  @Roles('ADMIN', 'USER')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;

    if (req.user?.role !== 'ADMIN' && userId !== id) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const data = await this.userService.remove(id);
    return successResponse(data, 'User deleted');
  }



   @Put()
    async updateNotificationSettings(
      @Req() req: AuthenticatedRequest,
      @Body() dto: UpdateNotificationSettingsDto,
    ) {
      if (!req.user) {
        throw new UnauthorizedException();
      }
      const settings = await this.userService.updateNotificationSettings(
        req.user.userId,
        dto,
      );
      return successResponse(
        settings,
        'Notification settings updated successfully.',
      );
    }

  
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import {  FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  // ✅ Update profile
  @Roles('ADMIN', 'USER')
  @Put('profile-update')

  async userProfileUpdate(@Body() dto: UpdateProfileDto, @Req() req) {
    const result = await this.userService.profileUpdate(dto, req.user.userId);
    return successResponse(result, 'User profile updated successfully.');
  }


  @Roles('ADMIN', 'USER')
  @Put('profile-photo')
  @UseInterceptors(FileInterceptor('file')) // <-- single file upload
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId =req.user?.userId;
    console.log("user id ", userId)
    if(!userId){
      throw new BadRequestException(
        'No User id.',
      );
    }

    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please provide a file.',
      );
    }

    const data = await this.userService.uploadFile(file, userId);
    return successResponse(data, 'Profile photo updated successfully');
  }


  // ✅ List users (ADMIN only)
  @Get('user-list')
  @Roles('ADMIN')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') searchTerm?: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query() query?: any,
  ) {
    // page, limit, search, order remove from query to get actual filters
    const { page: _p, limit: _l, search: _s, order: _o, ...filters } = query;

    const data = await this.userService.findAll(
      Number(page),
      Number(limit),
      searchTerm,
      order,
      filters,
    );
    return successResponse(data, 'Users fetched');
  }


  // ✅ Get own profile
  @Get('me')
  @Roles('ADMIN', 'USER')
  async findOne(@Req() req) {
    const id = req.user?.userId;
    const data = await this.userService.findOne(id);
    return successResponse(data, 'User fetched');
  }

  // ✅ Soft delete (self or admin)
  @Delete(':id')
  @Roles('ADMIN', 'USER')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.userId;

    if (req.user?.role !== 'ADMIN' && userId !== id) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const data = await this.userService.remove(Number(id));
    return successResponse(data, 'User deleted');
  }


}

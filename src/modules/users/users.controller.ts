import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { successResponse } from 'src/common/response';
import { UpdateProfileDto } from './dto/user-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Roles('ADMIN', 'USER')
    @Put('profile-update')
    async userProfileUpdate(@Body() updateProfileDto: UpdateProfileDto, @Req() req) {
        const result = await this.userService.profileUpdate(updateProfileDto, req.user.userId);
        return successResponse(result, "User profile updated successfully.")
    }

}

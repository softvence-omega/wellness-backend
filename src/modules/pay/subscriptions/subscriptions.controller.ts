import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionsController {
  constructor(private readonly subsService: SubscriptionsService) {}

  @Get('me')
  async getMySubscription(@Req() req: any) {
    console.log('req.user:', req.user);

    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    return this.subsService.getMySubscription(userId);
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';


@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const usageType = req.body.usageType as 'prompts' | 'medicalReports' | 'mealScans';

    if (!usageType) return true;

    try {
      await this.subsService.incrementUsage(userId, usageType);
      return true;
    } catch {
      throw new ForbiddenException(
        `You've reached your ${usageType} limit. Upgrade to Pro!`,
      );
    }
  }
}
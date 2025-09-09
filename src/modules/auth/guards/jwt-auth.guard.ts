import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Custom message when no token or invalid token
    if (err || !user) {
      throw new UnauthorizedException(
        info?.message || 'You must provide a valid access token to access this resource.',
      );
    }
    return user;
  }
}

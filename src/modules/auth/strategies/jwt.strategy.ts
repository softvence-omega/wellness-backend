import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // ✅ use ConfigService
    });

    if (!configService.get<string>('JWT_SECRET')) {
      throw new Error('JWT_SECRET is not defined in .env'); // safeguard
    }
  }

  async validate(payload: any) {
    const userIdFromPayload = payload.userId; // match token payload
    const user = await this.prisma.user.findUnique({
      where: { id: userIdFromPayload },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

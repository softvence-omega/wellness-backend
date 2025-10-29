import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', { infer: true }),
      issuer:
        configService.get<string>('JWT_ISSUER', { infer: true }) || 'my-app',
      audience:
        configService.get<string>('JWT_AUDIENCE', { infer: true }) ||
        'my-app-users',
    });

    const requiredVars = ['JWT_SECRET'];
    for (const envVar of requiredVars) {
      if (!this.configService.get<string>(envVar, { infer: true })) {
        this.logger.error(`${envVar} is not defined in environment variables`);
        throw new Error(`${envVar} is not defined in .env`);
      }
    }

    // Warn if issuer or audience are not set, but don't fail
    if (!this.configService.get<string>('JWT_ISSUER', { infer: true })) {
      this.logger.warn('JWT_ISSUER not set, using default: my-app');
    }
    if (!this.configService.get<string>('JWT_AUDIENCE', { infer: true })) {
      this.logger.warn('JWT_AUDIENCE not set, using default: my-app-users');
    }
  }

  async validate(payload: JwtPayload) {
    this.logger.log(`Validating JWT for sub: ${payload.sub}`);

    if (!payload.sub || !payload.email || !payload.role) {
      this.logger.warn(`Invalid JWT payload: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token payload');
    }

    // Remove the parseInt conversion since IDs are now strings (CUID)
    const userId = payload.sub;

    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false }, // id is now string
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      this.logger.warn(`User not found for userId: ${userId}`);
      throw new UnauthorizedException('User not found or disabled');
    }

    return {
      userId: user.id, // This is now a string
      email: user.email,
      role: user.role.toString(),
    };
  }
}

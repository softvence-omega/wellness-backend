import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from '../email/email.module';
import { GoogleService } from '../google/google.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'], // Load .env files
      isGlobal: false, // Keep ConfigModule local to avoid conflicts
      validate: (config: Record<string, any>) => {
        const requiredVars = [
          'JWT_SECRET',
          'ACCESS_TOKEN_EXPIREIN',
          'REFRESH_TOKEN_EXPIREIN',
          'APPLE_CLIENT_ID',
          'APPLE_TEAM_ID',
          'APPLE_KEY_ID',
          // 'APPLE_PRIVATE_KEY_PATH',
        ];
        for (const envVar of requiredVars) {
          if (!config[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
          }
        }
        // Validate JWT duration formats
        const validateJwtDuration = (
          value: string,
          name: string,
        ): string | number => {
          if (/^\d+$/.test(value)) {
            return parseInt(value, 10); // Convert to number for seconds
          }
          if (/^\d+[smhdwMy]$/.test(value)) {
            return value; // Valid JWT duration string (e.g., '1h', '30d')
          }
          throw new Error(
            `Invalid ${name}: must be a number or valid JWT duration (e.g., '3600', '1h', '30d')`,
          );
        };
        validateJwtDuration(
          config.ACCESS_TOKEN_EXPIREIN,
          'ACCESS_TOKEN_EXPIREIN',
        );
        validateJwtDuration(
          config.REFRESH_TOKEN_EXPIREIN,
          'REFRESH_TOKEN_EXPIREIN',
        );
        return config;
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    MailModule,
    JwtModule.registerAsync({
      global: true, // Make JwtModule global to share JwtService
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET', {
          infer: true,
        });
        if (!jwtSecret) {
          throw new Error('JWT_SECRET is not defined');
        }
        return {
          secret: jwtSecret,
          // expiresIn not set here; handled by AuthService
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {
  private readonly logger = new Logger(AuthModule.name);

  constructor() {
    this.logger.log('AuthModule initialized');
  }
}

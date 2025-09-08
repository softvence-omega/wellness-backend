import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailModule } from '../email/email.module';
import { MailService } from '../email/email.service';

@Module({
  imports: [
 
    PassportModule,
       PrismaModule,
       MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, MailService],
  exports: [AuthService],
})
export class AuthModule {}

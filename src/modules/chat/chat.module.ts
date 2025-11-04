
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

import { HttpModule } from '@nestjs/axios';
import { ChatService } from './chat.service';
import { AiClientService } from './ai/ai-client.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PrismaService, AiClientService, WsJwtGuard, ConfigService],
})
export class ChatModule {}
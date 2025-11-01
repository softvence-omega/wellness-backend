// src/chat/chat.service.ts
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiClientService } from './ai/ai-client.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageType } from '@prisma/client';

interface SendMessageResult {
  userMessage: any;
  aiMessage: any;
  roomId: string;
}

interface ExpiredResult {
  expired: true;
  message: string;
}

type ChatResult = SendMessageResult | ExpiredResult;

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}
  async createRoom(userId: string, dto: CreateRoomDto) {

  const conversation = await this.prisma.conversation.create({
    data: { 
      title: dto.name,
      user: {
        connect: { id: userId }  
      }
    },
  });

  return this.prisma.room.create({
    data: {
      name: dto.name,
      maxPrompts: dto.maxPrompts || 10, 
      members: { 
        create: { 
          user: {
            connect: { id: userId }  
          }
        } 
      },
      chats: {
        create: {
          conversationId: conversation.id,
          senderId: userId,
          type: MessageType.TEXT,
          content: `Room "${dto.name}" created`,
        },
      },
    },
    include: { chats: true },
  });
}

  async joinRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room || (room.expiresAt && new Date() > room.expiresAt)) {
      throw new BadRequestException('Room not found or expired');
    }

    const existing = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (existing?.leftAt) {
      return this.prisma.roomMember.update({
        where: { id: existing.id },
        data: { leftAt: null },
      });
    }

    if (!existing) {
      return this.prisma.roomMember.create({ data: { roomId, userId } });
    }
    return existing;
  }

  async leaveRoom(userId: string, roomId: string) {
    await this.prisma.roomMember.updateMany({
      where: { roomId, userId, leftAt: null },
      data: { leftAt: new Date() },
    });

    const active = await this.prisma.roomMember.count({ where: { roomId, leftAt: null } });
    if (active === 0) {
      await this.prisma.room.update({
        where: { id: roomId },
        data: { expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });
    }
  }

// In your chat.service.ts - update sendMessage method
async sendMessage(userId: string, roomId: string, dto: SendMessageDto): Promise<ChatResult> {
  const room = await this.prisma.room.findUnique({
    where: { id: roomId },
    include: { chats: { take: 1, orderBy: { createdAt: 'asc' } } },
  });
  if (!room || (room.expiresAt && new Date() > room.expiresAt)) {
    throw new BadRequestException('Room not found or expired');
  }

  const member = await this.prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!member || member.leftAt) throw new ForbiddenException('Not in room');

  if (room.promptUsed >= room.maxPrompts) {
    return { expired: true, message: 'Prompt expired. Please use another chat.' };
  }

  // Get conversationId from first chat
  const conversationId = room.chats[0]?.conversationId;
  if (!conversationId) throw new BadRequestException('No conversation linked');

  const userMsg = await this.prisma.chat.create({
    data: {
      conversationId,
      roomId,
      senderId: userId,
      type: MessageType.TEXT,
      content: dto.content,
    },
  });

  await this.prisma.room.update({
    where: { id: roomId },
    data: { promptUsed: { increment: 1 }, lastActive: new Date() },
  });

  // Pass both userId and dto.userId to AI service
  const aiResp = await this.aiClient.sendQuery(dto.content, userId, dto.userId);
  const aiMsg = await this.prisma.chat.create({
    data: {
      conversationId,
      roomId,
      senderId: userId,
      type: MessageType.AI_RESPONSE,
      content: aiResp.response,
    },
  });

  return { userMessage: userMsg, aiMessage: aiMsg, roomId };
}

  // async sendMessage(userId: string, roomId: string, dto: SendMessageDto): Promise<ChatResult> {
  //   const room = await this.prisma.room.findUnique({
  //     where: { id: roomId },
  //     include: { chats: { take: 1, orderBy: { createdAt: 'asc' } } },
  //   });
  //   if (!room || (room.expiresAt && new Date() > room.expiresAt)) {
  //     throw new BadRequestException('Room not found or expired');
  //   }

  //   const member = await this.prisma.roomMember.findUnique({
  //     where: { roomId_userId: { roomId, userId } },
  //   });
  //   if (!member || member.leftAt) throw new ForbiddenException('Not in room');

  //   if (room.promptUsed >= room.maxPrompts) {
  //     return { expired: true, message: 'Prompt expired. Please use another chat.' };
  //   }

  //   // Get conversationId from first chat
  //   const conversationId = room.chats[0]?.conversationId;
  //   if (!conversationId) throw new BadRequestException('No conversation linked');

  //   const userMsg = await this.prisma.chat.create({
  //     data: {
  //       conversationId,
  //       roomId,
  //       senderId: userId,
  //       type: MessageType.TEXT,
  //       content: dto.content,
  //     },
  //   });

  //   await this.prisma.room.update({
  //     where: { id: roomId },
  //     data: { promptUsed: { increment: 1 }, lastActive: new Date() },
  //   });

  //   const aiResp = await this.aiClient.sendQuery(dto.content, userId);
  //   const aiMsg = await this.prisma.chat.create({
  //     data: {
  //       conversationId,
  //       roomId,
  //       senderId: userId,
  //       type: MessageType.AI_RESPONSE,
  //       content: aiResp.response,
  //     },
  //   });

  //   return { userMessage: userMsg, aiMessage: aiMsg, roomId };
  // }

  async getRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        chats: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, email: true } } },
        },
        members: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    if (!room || (room.expiresAt && new Date() > room.expiresAt)) {
      throw new BadRequestException('Room not found or expired');
    }

    const isMember = room.members.some(m => m.userId === userId && !m.leftAt);
    if (!isMember) throw new ForbiddenException('Not in room');

    return room;
  }

  async listRooms(userId: string) {
    return this.prisma.roomMember.findMany({
      where: { userId, leftAt: null },
      include: {
        room: {
          include: {
            _count: { select: { chats: true } },
          },
        },
      },
    });
  }
}
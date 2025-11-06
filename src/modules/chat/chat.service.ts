
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiClientService } from './ai/ai-client.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageType } from '@prisma/client';
import {  SaveAiResponseResponse } from './types/ai-response.type';
import { SaveAiResponseDto } from './dto/ai-response.dto';
import { RoomListResponse } from './types/room-list.type';

interface SendMessageResult {
  userMessage: any;
  aiMessage: any;
  roomId: string;
}

interface ExpiredResult {
  expired: true;
  message: string;
}

interface AiResponseItem {
  id: string;
  content: string;
  responseData: string;
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

async listRooms(userId: string): Promise<RoomListResponse> {
  const memberships = await this.prisma.roomMember.findMany({
    where: {
      userId,
      leftAt: null,
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      room: {
        select: {
          id: true,
          name: true,
          aiTitle: true,
          maxPrompts: true,
          promptUsed: true,
          lastActive: true,
          capacity: true,
          location: true,
          createdAt: true,
          // Efficient chat count
          chats: {
            select: { id: true },
            where: { type: MessageType.AI_RESPONSE }, // Only count AI responses
          },
        },
      },
    },
    orderBy: {
      room: {
        lastActive: 'desc', // Most recent first
      },
    },
  });

  // Transform to clean response
  return {
    success: true,
    data: memberships.map(m => ({
      membershipId: m.id,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      room: {
        id: m.room.id,
        name: m.room.name,
        aiTitle: m.room.aiTitle ?? null,
        maxPrompts: m.room.maxPrompts,
        promptUsed: m.room.promptUsed,
        lastActive: m.room.lastActive?.toISOString() ?? null,
        capacity: m.room.capacity ?? null,
        location: m.room.location ?? null,
        createdAt: m.room.createdAt.toISOString(),
        chatCount: m.room.chats.length, // Direct count, no _count overhead
      },
    })),
  };
}

  //=======================for ai response========
async saveAiResponseToRoom(
  roomId: string,
  dto: SaveAiResponseDto,
): Promise<SaveAiResponseResponse> {
  const { maxPrompt, promptUsed, chat, aiTitle } = dto;

  const room = await this.prisma.room.findUnique({
    where: { id: roomId },
    include: { chats: { take: 1, orderBy: { createdAt: 'asc' } } },
  });
  if (!room) throw new NotFoundException('Room not found');

  let conversationId = room.chats[0]?.conversationId;
  if (!conversationId) {
    const member = await this.prisma.roomMember.findFirst({ where: { roomId } });
    const conv = await this.prisma.conversation.create({
      data: { title: room.name, userId: member!.userId },
    });
    conversationId = conv.id;
  }

  await this.prisma.room.update({
    where: { id: roomId },
    data: {
      maxPrompts: maxPrompt,
      promptUsed,
      lastActive: new Date(),
      aiTitle,                     
    },
  });

  const savedChats: AiResponseItem[] = [];

  for (const item of chat) {
    const saved = await this.prisma.chat.create({
      data: {
        conversationId,
        roomId,
        senderId: null,
        type: MessageType.AI_RESPONSE,
        content: item.content,
        responseData: item.responseData,
      },
    });

    savedChats.push({
      id: saved.id,
      content: saved.content ?? '',
      responseData: saved.responseData ?? '',
    });
  }

  return {
    success: true,
    data: {
      roomId,
      aiTitle,                     
      maxPrompt,
      promptUsed,
      chat: savedChats,
    },
  };
}

 async getAiResponseByRoom(roomId: string): Promise<SaveAiResponseResponse> {
  const room = await this.prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      aiTitle: true,               // ← FETCH
      maxPrompts: true,
      promptUsed: true,
      chats: {
        where: { type: MessageType.AI_RESPONSE },
        select: {
          id: true,
          content: true,
          responseData: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!room) throw new NotFoundException('Room not found');

  const chat = room.chats.map(c => ({
    id: c.id,
    content: c.content ?? '',
    responseData: c.responseData ?? '',
  }));

  return {
    success: true,
    data: {
      roomId: room.id,
      aiTitle: room.aiTitle ?? undefined,   // ← RETURN
      maxPrompt: room.maxPrompts,
      promptUsed: room.promptUsed,
      chat,
    },
  };
}
}
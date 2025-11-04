// src/chat/chat.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChatResult } from './types/chat-response.type';
import { SaveAiResponseDto } from './dto/ai-response.dto';


@ApiTags('Chat Rooms')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Helper method to get user ID from user object
  private getUserId(user: any): string {
    console.log('=== Getting User ID ===');
    console.log('User object:', user);
    console.log('Available keys:', Object.keys(user || {}));

    // Try different possible ID fields
    const userId = user?.sub || user?.id || user?.userId;
    console.log('Resolved userId:', userId);

    if (!userId) {
      throw new HttpException(
        'User ID not found in JWT payload',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return userId;
  }

  @Post('room')
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Room created' })
  async createRoom(@CurrentUser() user: any, @Body() dto: CreateRoomDto) {
    try {
      const userId = this.getUserId(user);
      return await this.chatService.createRoom(userId, dto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create room',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('room/:id/join')
  @ApiOperation({ summary: 'Join a chat room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async joinRoom(@CurrentUser() user: any, @Param('id') id: string) {
    try {
      const userId = this.getUserId(user);
      console.log(`Joining room ${id} with user ${userId}`);
      return await this.chatService.joinRoom(userId, id);
    } catch (error) {
      console.error('Join room error:', error);
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Post('room/:id/leave')
  @ApiOperation({ summary: 'Leave a chat room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async leaveRoom(@CurrentUser() user: any, @Param('id') id: string) {
    try {
      const userId = this.getUserId(user);
      return await this.chatService.leaveRoom(userId, id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('room/:id/message')
  @ApiOperation({ summary: 'Send message in room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent' })
  @ApiResponse({ status: 400, description: 'Prompt expired' })
  async sendMessage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Promise<ChatResult> {
    try {
      const userId = this.getUserId(user);
      return await this.chatService.sendMessage(userId, id, dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('room/:id')
  @ApiOperation({ summary: 'Get room with chat history' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async getRoom(@CurrentUser() user: any, @Param('id') id: string) {
    try {
      const userId = this.getUserId(user);
      return await this.chatService.getRoom(userId, id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List active rooms for user' })
  async listRooms(@CurrentUser() user: any) {
    try {
      const userId = this.getUserId(user);
      return await this.chatService.listRooms(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch rooms',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

@Post('ai-response/:roomId')
@ApiBody({ type: SaveAiResponseDto })
async postAiResponse(
  @Param('roomId') roomId: string,
  @Body() body: SaveAiResponseDto,
) {
  return this.chatService.saveAiResponseToRoom(roomId, body);
}
}

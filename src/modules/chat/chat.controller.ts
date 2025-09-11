import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { successResponse } from 'src/common/response';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role-auth.guard';




@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) { }

    // Create new conversation
    @Roles('ADMIN', 'USER')
    @Post('conversation')
    async createConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
        const userId = req.user.userId;
        console.log("user", userId)
        const result = await this.chatService.createConversation(dto, userId);
        return successResponse(result, 'Conversation created successfully');
    }

    // Get all conversations of a user
    @Roles('ADMIN', 'USER')

    @Get('get-all-conversation')
    async getConversations(
        @Req() req: any,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        const userId = req.user.userId
        const result = await this.chatService.getConversations(
            Number(userId),
            Number(page),
            Number(limit),
        );
        return successResponse(result, 'Conversations fetched successfully');
    }

    // Create chat message
    @Roles('ADMIN', 'USER')
    @Post('create-message')
    async createChat(@Req() req: any, @Body() dto: CreateChatDto) {
        const userId = req.user.userId

        const result = await this.chatService.createChat(dto, userId);
        return successResponse(result, 'Message sent successfully');
    }

@Roles('ADMIN', 'USER')
@Post('delete-conversation-with-chats')
async deleteConversationWithChat(
  @Req() req: any,
  @Body('conversationId') conversationId: string, // only need ID from body
) {
  const userId = req.user.userId;

  const result = await this.chatService.deleteConversationWithChats(
    Number(conversationId),
    Number(userId),
  );

  return successResponse(result, 'Conversation deleted successfully');
}


    // Get all messages of a conversation
    @Roles('ADMIN', 'USER')
    @Get('messages/:conversationId')
    async getChats(
        @Param('conversationId') conversationId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        const result = await this.chatService.getChats(
            Number(conversationId),
            Number(page),
            Number(limit),
        );
        return successResponse(result, 'Messages fetched successfully');
    }
}

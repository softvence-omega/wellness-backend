import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    //Conversation create
    async createConversation(dto: CreateConversationDto, userId: any) {
        const conversation = await this.prisma.conversation.create({
            data: {
                title: dto.title,
                userId: userId
            }
        })
        return conversation;
    }

    //List all conversation for a user
    async getConversations(userId: number, page = 1, limit = 20, searchTerm?: string) {
        //Build search filter

        const where: any = { userId };
        if (searchTerm && searchTerm.trim() != '') {
            where.title = {
                contains: searchTerm,
                mode: 'insensitive'
            }
        }
        // Fetch conversations with the latest chat included
        const conversations = await this.prisma.conversation.findMany({
            where,
            orderBy: {
                updatedAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                chats: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                email: true,
                                profile: {   // ✅ put it inside select, not include
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });


        // Total conversations count for pagination
        const total = await this.prisma.conversation.count({
            where: {
                userId
            }
        })

        // Map to a clear structure

        const result = conversations.map((conv) => ({
            id: conv.id,
            title: conv.title,
            latestMessage: conv.chats[0] || null,
            updateAt: conv.updatedAt
        }))
        return {
            result,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        }
    }

    //create chat message
    async createChat(dto: CreateChatDto, userId: any) {
        //check if conversation exists
        const conv = await this.prisma.conversation.findUnique({
            where: { id: Number(dto.conversationId) }
        })
        if (!conv) throw new NotFoundException('Conversation not found')

        return this.prisma.chat.create({
            data: {
                conversationId: Number(dto.conversationId),
                senderId: userId,
                type: dto.type,
                content: dto.content
            }
        })
    }

    //get all chats of a conversation
    async getChats(conversationId: number, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const chats = await this.prisma.chat.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })
        const total = await this.prisma.chat.count({
            where: {
                conversationId
            }
        })

        return {
            result: chats.reverse(),
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        }
    }
    // Delete a conversation and all its chats
    async deleteConversationWithChats(conversationId: number, userId: number) {
        // 1. check if the conversation exists and belongs to the user
        const conv = await this.prisma.conversation.findUnique({
            where: {
                id: conversationId
            }
        })


        if (!conv) throw new NotFoundException('Conversation not found');
        if (conv.userId !== userId) throw new ForbiddenException('Not allowed to delete conversation')

        // 2. Delete all related chats first

        await this.prisma.chat.deleteMany({
            where: {
                conversationId
            }
        })

        // 3. Delete the conversation itself
        await this.prisma.conversation.delete({
            where: { id: conversationId },
        });


        return;

    }



}

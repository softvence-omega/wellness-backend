
import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  OnGatewayDisconnect, 
  OnGatewayConnection,
   
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

interface AuthSocket extends Socket {
  user: { sub: string };
  roomId?: string;
}

interface SendMessageData {
  content: string;
  userId?: string; // Add this optional field
}

@WebSocketGateway({ cors: { origin: '*' }, path:'/chat'})
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`🟢 WebSocket Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.log(`🔴 WebSocket Client disconnected: ${client.id}`);
    if (client.roomId) {
      this.chatService.leaveRoom(client.user.sub, client.roomId);
      client.leave(client.roomId);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoin(@ConnectedSocket() client: AuthSocket, @MessageBody() { roomId }: { roomId: string }) {
    this.logger.log(`🎯 JoinRoom event from client: ${client.id}, room: ${roomId}`);
    
    await this.chatService.joinRoom(client.user.sub, roomId);
    client.roomId = roomId;
    client.join(roomId);
    client.emit('joined', { roomId });

    const room = await this.chatService.getRoom(client.user.sub, roomId);
    client.emit('history', room.chats);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket, 
    @MessageBody() data: SendMessageData // Update to accept both content and userId
  ) {
    this.logger.log(`💬 SendMessage event from client: ${client.id}`);
    this.logger.debug(`Message data: ${JSON.stringify(data)}`);
    this.logger.debug(`Client roomId: ${client.roomId}`);

    if (!client.roomId) {
      this.logger.error('Client not in any room');
      return client.emit('error', { message: 'Not in room' });
    }

    if (!data?.content) {
      this.logger.error('No content provided');
      return client.emit('error', { message: 'Content is required' });
    }

    try {
      // Pass both content and userId to the service
      const result = await this.chatService.sendMessage(
        client.user.sub, 
        client.roomId, 
        { 
          content: data.content,
          userId: data.userId // Pass the optional userId
        }
      );

      if ('expired' in result) {
        this.logger.warn(`Room ${client.roomId} has expired prompts`);
        this.server.to(client.roomId).emit('expired', { message: result.message });
        return;
      }

      this.logger.log('✅ Message processed successfully');

      // Emit user message to room
      this.server.to(client.roomId).emit('message', {
        ...result.userMessage,
        isAi: false,
      });

      // Stream AI response tokens
      const aiContent = result.aiMessage?.content ?? '';
      const words = aiContent.split(' ').filter(Boolean);

      this.logger.debug(`Streaming ${words.length} tokens for AI response`);
      
      for (const word of words) {
        this.server.to(client.roomId).emit('token', { token: word + ' ' });
        await new Promise(r => setTimeout(r, 50));
      }

      // Emit final AI message
      this.server.to(client.roomId).emit('message', {
        ...result.aiMessage,
        isAi: true,
      });

      this.logger.log('✅ AI response streaming completed');

    } catch (error) {
      this.logger.error(`❌ Send message error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}

// // src/chat/chat.gateway.ts
// import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { ChatService } from './chat.service';
// import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

// interface AuthSocket extends Socket {
//   user: { sub: string };
//   roomId?: string;
// }

// @WebSocketGateway({ cors: { origin: '*' }, path:'/chat'})
// export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection {
//   @WebSocketServer() server: Server;

//   constructor(private chatService: ChatService) {}

//   handleConnection(client: any, ...args: any[]) {
//     console.log(`Client connected: ${client.id}`);
//   }


//   @UseGuards(WsJwtGuard)
//   @SubscribeMessage('joinRoom')
//   async handleJoin(@ConnectedSocket() client: AuthSocket, @MessageBody() { roomId }: { roomId: string }) {
//     await this.chatService.joinRoom(client.user.sub, roomId);
//     client.roomId = roomId;
//     client.join(roomId);
//     client.emit('joined', { roomId });

//     const room = await this.chatService.getRoom(client.user.sub, roomId);
//     client.emit('history', room.chats);
//   }

//   @UseGuards(WsJwtGuard)
//   @SubscribeMessage('sendMessage')
//   async handleMessage(@ConnectedSocket() client: AuthSocket, @MessageBody() { content }: { content: string }) {
//     if (!client.roomId) return client.emit('error', { message: 'Not in room' });

//     const result = await this.chatService.sendMessage(client.user.sub, client.roomId, { content });

//     if ('expired' in result) {
//       this.server.to(client.roomId).emit('expired', { message: result.message });
//       return;
//     }

//     this.server.to(client.roomId).emit('message', {
//       ...result.userMessage,
//       isAi: false,
//     });

//     const aiContent = result.aiMessage?.content ?? '';
//     const words = aiContent.split(' ').filter(Boolean);

//     for (const word of words) {
//       this.server.to(client.roomId).emit('token', { token: word + ' ' });
//       await new Promise(r => setTimeout(r, 50));
//     }

//     this.server.to(client.roomId).emit('message', {
//       ...result.aiMessage,
//       isAi: true,
//     });
//   }

//   async handleDisconnect(client: AuthSocket) {
//     if (client.roomId) {
//       await this.chatService.leaveRoom(client.user.sub, client.roomId);
//       client.leave(client.roomId);
//     }
//   }
// }
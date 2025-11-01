
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface AiRequest { 
  query: string; 
  userId?: string;
}

interface AiResponse { 
  query: string; 
  response: string; 
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly AI_URL = 'https://wellness-rag-ai-app.onrender.com/api/v1/wellness/chat';

  constructor(private http: HttpService) {}

  async sendQuery(query: string, userId: string, additionalUserId?: string): Promise<AiResponse> {
    this.logger.log(`🤖 Sending AI query for user: ${userId}`);
    this.logger.debug(`Query: ${query}`);
    this.logger.debug(`Additional User ID: ${additionalUserId}`);
    this.logger.debug(`AI URL: ${this.AI_URL}`);

    // Use the additionalUserId if provided, otherwise use the main userId
    const finalUserId = additionalUserId || userId;
    
    const payload: AiRequest = { 
      query,
      userId: finalUserId
    };

    this.logger.debug(`Final payload: ${JSON.stringify(payload)}`);
    
    try {
      const response = await firstValueFrom(
        this.http.post<AiResponse>(this.AI_URL, payload, { 
          timeout: 50000,
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );

      this.logger.log(`✅ AI response received successfully`);
      this.logger.debug(`AI response: ${JSON.stringify(response.data)}`);
      
      return response.data;
    } catch (error) {
      this.logger.error(`❌ AI API Error: ${error.message}`);
      
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        this.logger.error(`No response received from AI service`);
      }
      
      // Return a fallback response
      return {
        query: query,
        response: `I'm currently unavailable. Please try again later. [User: ${finalUserId}]`
      };
    }
  }

  async *streamResponse(query: string, userId: string, additionalUserId?: string): AsyncGenerator<any> {
    this.logger.log(`🔄 Streaming AI response for user: ${additionalUserId || userId}`);
    
    const resp = await this.sendQuery(query, userId, additionalUserId);
    const words = resp.response.split(' ').filter(word => word.trim().length > 0);
    
    this.logger.debug(`Streaming ${words.length} words`);
    
    for (const word of words) {
      yield { token: word + ' ' };
      await new Promise(r => setTimeout(r, 50));
    }
    
    yield { 
      token: '[DONE]', 
      usage: { 
        prompt_tokens: query.split(' ').length, 
        completion_tokens: words.length 
      } 
    };
  }
}

// // src/ai/ai-client.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';

// interface AiRequest { query: string; }
// interface AiResponse { query: string; response: string; }

// @Injectable()
// export class AiClientService {
//   private readonly logger = new Logger(AiClientService.name);
//   private readonly AI_URL = 'https://wellness-rag-ai-app.onrender.com/api/v1/wellness/chat';

//   constructor(private http: HttpService) {}

//   async sendQuery(query: string, userId: string): Promise<AiResponse> {
//     const payload: AiRequest = { query };
//     const response = await firstValueFrom(
//       this.http.post<AiResponse>(this.AI_URL, payload, { timeout: 30000 })
//     );
//     return response.data;
//   }

//   async *streamResponse(query: string, userId: string): AsyncGenerator<any> {
//     const resp = await this.sendQuery(query, userId);
//     const words = resp.response.split(' ');
//     for (const w of words) {
//       yield { token: w + ' ' };
//       await new Promise(r => setTimeout(r, 50));
//     }
//     yield { token: '[DONE]', usage: { prompt_tokens: query.split(' ').length, completion_tokens: words.length } };
//   }
// }
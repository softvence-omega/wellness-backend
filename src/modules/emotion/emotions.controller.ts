// src/emotions/emotions.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  // Remove ParseUUIDPipe import
} from '@nestjs/common';
import { EmotionsService } from './emotions.service';
import { EmotionQueryDto } from './dto/emotion-query.dto';
import { CreateEmotionDto } from './dto/create-emotion-reaction.dto';

@Controller('emotions')
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}

  @Post()
  async create(@Body() createEmotionDto: CreateEmotionDto) {
    return this.emotionsService.createEmotion(createEmotionDto);
  }

  @Get('user/:userId')
  async getUserEmotions(
    @Param('userId') userId: string, // Remove ParseUUIDPipe
    @Query() query: EmotionQueryDto,
  ) {
    return this.emotionsService.getUserEmotions(userId, query);
  }

  @Get('trends/:userId')
  async getEmotionalTrends(
    @Param('userId') userId: string, // Remove ParseUUIDPipe
    @Query('days') days: number = 7,
  ) {
    return this.emotionsService.getEmotionalTrends(userId, +days);
  }

  @Get('supported-emojis')
  getSupportedEmojis() {
    return this.emotionsService.getSupportedEmojis();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) { // Remove ParseUUIDPipe
    return this.emotionsService.deleteEmotion(id);
  }
}

// // src/emotions/emotions.controller.ts
// import {
//   Controller,
//   Get,
//   Post,
//   Delete,
//   Body,
//   Param,
//   Query,
//   HttpCode,
//   HttpStatus,
//   ParseUUIDPipe,
// } from '@nestjs/common';
// import { EmotionsService } from './emotions.service';

// import { EmotionQueryDto } from './dto/emotion-query.dto';
// import { CreateEmotionDto } from './dto/create-emotion-reaction.dto';

// @Controller('emotions')
// export class EmotionsController {
//   constructor(private readonly emotionsService: EmotionsService) {}

//   @Post()
//   async create(@Body() createEmotionDto: CreateEmotionDto) {
//     return this.emotionsService.createEmotion(createEmotionDto);
//   }

//   @Get('user/:userId')
//   async getUserEmotions(
//     @Param('userId', ParseUUIDPipe) userId: string,
//     @Query() query: EmotionQueryDto,
//   ) {
//     return this.emotionsService.getUserEmotions(userId, query);
//   }

//   @Get('trends/:userId')
//   async getEmotionalTrends(
//     @Param('userId', ParseUUIDPipe) userId: string,
//     @Query('days') days: number = 7,
//   ) {
//     return this.emotionsService.getEmotionalTrends(userId, +days);
//   }

//   @Get('supported-emojis')
//   getSupportedEmojis() {
//     return this.emotionsService.getSupportedEmojis();
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async remove(@Param('id', ParseUUIDPipe) id: string) {
//     return this.emotionsService.deleteEmotion(id);
//   }
// }
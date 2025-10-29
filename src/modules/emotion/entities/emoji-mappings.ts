// src/emotions/emoji-mappings.ts
export interface EmojiMapping {
  emotion: string;
  color: string;
  description: string;
}

export const EMOJI_MAPPINGS: { [emoji: string]: EmojiMapping } = {
  // Facebook Core Reactions
  '😍': {
    emotion: 'Love',
    color: '#F35369',
    description: 'Feeling loved or loving something',
  },
  '😂': {
    emotion: 'Haha',
    color: '#F7B125',
    description: 'Finding something funny',
  },
  '😮': {
    emotion: 'Wow',
    color: '#F7B125',
    description: 'Surprised or amazed',
  },
  '😢': {
    emotion: 'Sad',
    color: '#F7B125',
    description: 'Feeling sad or disappointed',
  },
  '😡': {
    emotion: 'Angry',
    color: '#E9710F',
    description: 'Feeling angry or frustrated',
  },
  '👍': {
    emotion: 'Like',
    color: '#1877F2',
    description: 'Approving or liking something',
  },

  '❤️': {
    emotion: 'Heart',
    color: '#F35369',
    description: 'Showing love or appreciation',
  },
  '🔥': {
    emotion: 'Fire',
    color: '#FF6B00',
    description: 'Something is amazing or hot',
  },
  '🎉': {
    emotion: 'Celebrate',
    color: '#F7B125',
    description: 'Celebrating or excited',
  },
  '🙏': {
    emotion: 'Prayer',
    color: '#1877F2',
    description: 'Thankful or praying',
  },
  '😴': { emotion: 'Sleepy', color: '#1877F2', description: 'Tired or bored' },
  '🤔': {
    emotion: 'Thinking',
    color: '#1877F2',
    description: 'Thoughtful or curious',
  },
};

export const SUPPORTED_EMOJIS = Object.keys(EMOJI_MAPPINGS);
export const DEFAULT_EMOJI = '👍';

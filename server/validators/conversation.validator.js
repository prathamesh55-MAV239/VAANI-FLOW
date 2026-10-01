import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().trim().max(100).optional().default('New Conversation'),
});

export const updateConversationSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title cannot be empty' }).max(100),
});

export const chatSchema = z.object({
  conversationId: z.string().min(1, { message: 'conversationId is required' }),
  message: z.string().trim().min(1, { message: 'Message content cannot be empty' }),
  inputLanguage: z.enum(['en', 'hi', 'mr']).optional(),
  responseLanguage: z.enum(['en', 'hi', 'mr']).optional(),
});

export const speakSchema = z.object({
  text: z.string().trim().min(1, { message: 'Text cannot be empty' }),
  language: z.string().trim().optional(),
});

export const translateSchema = z.object({
  text: z.string().trim().min(1, { message: 'Text cannot be empty' }),
  sourceLanguage: z.string().trim().optional().default('auto'),
  targetLanguage: z.string().trim().min(2, { message: 'Target language code is required' }),
});

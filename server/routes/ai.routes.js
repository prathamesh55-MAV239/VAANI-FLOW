import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  chatSchema,
  speakSchema,
  translateSchema,
} from '../validators/conversation.validator.js';

const router = express.Router();

// Chat requires authentication to scope conversation history and messages
router.post('/chat', authenticateToken, validateBody(chatSchema), aiController.chat);

// Multimodal STT, TTS, and Translation endpoints
router.post('/transcribe', aiController.transcribe);
router.post('/speak', validateBody(speakSchema), aiController.speak);
router.post('/translate', validateBody(translateSchema), aiController.translate);

export default router;

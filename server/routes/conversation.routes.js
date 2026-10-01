import express from 'express';
import conversationController from '../controllers/conversation.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createConversationSchema,
  updateConversationSchema,
} from '../validators/conversation.validator.js';

const router = express.Router();

// All conversation routes require authentication
router.use(authenticateToken);

router.get('/', conversationController.getConversations);
router.post('/', validateBody(createConversationSchema), conversationController.createConversation);
router.get('/:id', conversationController.getConversationById);
router.patch('/:id', validateBody(updateConversationSchema), conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);
router.get('/:id/messages', conversationController.getConversationMessages);

export default router;

import express from 'express';
import { MessageController } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/conversations/create', authMiddleware, (req, res, next) => {
  console.log('Create conversation request - Auth User ID:', req.userId, 'Participant ID:', req.body.participantId);
  next();
}, MessageController.createConversation);

router.get('/conversations', authMiddleware, MessageController.getConversations);
router.get('/unread-count', authMiddleware, MessageController.getUnreadCount);
router.get('/conversations/:conversationId', authMiddleware, MessageController.getConversation);
router.put('/conversations/:conversationId/seen', authMiddleware, MessageController.markConversationAsSeen);
router.put('/conversations/:conversationId/read', authMiddleware, MessageController.markAsRead);

router.post('/conversations/:conversationId/send', authMiddleware, upload.single('file'), (req, res, next) => {
  console.log('Send message request - Auth User ID:', req.userId, 'Conversation ID:', req.params.conversationId, 'Has file:', !!req.file);
  next();
}, MessageController.sendMessage);

router.delete('/:messageId', authMiddleware, MessageController.deleteMessage);

export default router;


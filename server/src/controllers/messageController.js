import { MessageService } from '../services/messageService.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { io } from '../index.js';

export class MessageController {
  static async createConversation(req, res) {
    try {
      const { participantId, initialMessage } = req.body;
      if (!participantId) {
        return sendError(res, 'Participant ID is required', 400);
      }

      if (req.userId === participantId) {
        return sendError(res, 'You cannot message yourself', 400);
      }
      const conversation = await MessageService.getOrCreateConversation(req.userId, participantId);

      if (initialMessage && initialMessage.trim()) {
        try {
          await MessageService.sendMessage(
            conversation._id,
            req.userId,
            participantId,
            initialMessage.trim(),
            null,
            null
          );
        } catch (msgError) {
          console.error('⚠️ Failed to send initial message:', msgError.message);

        }
      }

      sendSuccess(res, conversation, 'Conversation created', 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getConversations(req, res) {
    try {
      const conversations = await MessageService.getConversations(req.userId);
      sendSuccess(res, conversations, 'Conversations retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;

      await MessageService.markConversationAsRead(conversationId, req.userId);

      const limit = 50;
      const skip = (page - 1) * limit;

      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username avatar')
        .populate('receiver', 'username avatar');

      sendSuccess(res, messages.reverse(), 'Conversation messages retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async sendMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const { text } = req.body;
      const file = req.file; 

      if (!conversationId) {
        return sendError(res, 'Conversation ID is required', 400);
      }

      const hasText = text && text.trim().length > 0;
      const hasMedia = !!file;

      if (!hasText && !hasMedia) {
        return sendError(res, 'Message must contain either text or media', 400);
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return sendError(res, 'Conversation not found', 404);
      }

      const receiverId = conversation.participants.find(
        p => p.toString() !== req.userId.toString()
      );

      if (!receiverId) {
        return sendError(res, 'Receiver not found in conversation', 400);
      }

      let mediaType = null;
      let mediaUrl = null;

      if (file) {

        mediaUrl = `/uploads/messages/${file.filename}`;

        if (file.mimetype.startsWith('image/')) {
          mediaType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          mediaType = 'video';
        } else if (file.mimetype.startsWith('audio/')) {
          mediaType = 'audio';
        }
      }

      const message = await MessageService.sendMessage(
        conversationId,
        req.userId,
        receiverId.toString(),
        text || '',
        mediaUrl,
        mediaType
      );

      io.to(receiverId.toString()).emit('message_received', message);

      io.to(`conversation_${conversationId}`).emit('message:new', message);

      sendSuccess(res, message, 'Message sent', 201);
    } catch (error) {
      console.error('Send message error:', error);
      sendError(res, error.message, 400);
    }
  }

  static async markAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const result = await MessageService.markConversationAsRead(conversationId, req.userId);
      sendSuccess(res, result, 'Conversation marked as read');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async markConversationAsSeen(req, res) {
    try {
      const { conversationId } = req.params;

      const result = await MessageService.markConversationAsSeen(conversationId, req.userId);

      io.to(`conversation_${conversationId}`).emit('messages:seen', {
        conversationId,
        seenBy: req.userId,
        seenAt: new Date()
      });

      sendSuccess(res, result, 'Conversation marked as seen');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const count = await Message.countDocuments({
        receiver: req.userId,
        read: false
      });
      sendSuccess(res, { count }, 'Unread count retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async deleteMessage(req, res) {
    try {
      const result = await MessageService.deleteMessage(req.params.messageId, req.userId);
      sendSuccess(res, result, 'Message deleted');
    } catch (error) {
      sendError(res, error.message, error.message === 'Not authorized to delete this message' ? 403 : 400);
    }
  }
}


import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export class MessageService {
  static async getOrCreateConversation(participant1Id, participant2Id) {
    let conversation = await Conversation.findOne({
      participants: { $all: [participant1Id, participant2Id] }
    }).populate('participants', 'username avatar _id isOnline lastActive');

    if (!conversation) {
      conversation = new Conversation({
        participants: [participant1Id, participant2Id]
      });
      await conversation.save();
      await conversation.populate('participants', 'username avatar _id isOnline lastActive');
    }

    return conversation;
  }

  static async getConversations(userId) {
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'username avatar _id isOnline lastActive')
      .populate({
        path: 'lastMessage',
        select: 'text sender receiver createdAt read'
      })
      .sort({ updatedAt: -1 });

    return conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId.toString());
      return {
        ...conv.toObject(),
        otherUser,
        participants: conv.participants
      };
    });
  }

  static async getConversationMessages(conversationId, page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'username avatar _id')
      .populate('receiver', 'username avatar _id')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    return messages;
  }

  static async sendMessage(conversationId, senderId, receiverId, text, mediaUrl = null, mediaType = null, storyReply = null) {
    if (!conversationId || !senderId || !receiverId) {
      throw new Error('Missing required fields: conversationId, senderId, receiverId');
    }

    if ((!text || !text.trim()) && !mediaUrl && !storyReply) {
      throw new Error('Message must contain either text, media, or a story reply');
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const participantIds = conversation.participants.map(p => p.toString());
    if (!participantIds.includes(senderId.toString()) || !participantIds.includes(receiverId.toString())) {
      throw new Error('User is not a participant in this conversation');
    }

    const messageData = {
      conversationId,
      sender: senderId,
      receiver: receiverId,
      text: text || '',
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      read: false,
      storyReply: storyReply || null
    };

    const message = new Message(messageData);

    await message.save();
    await message.populate('sender', 'username avatar _id');
    await message.populate('receiver', 'username avatar _id');

    let previewText = text?.trim() || '';
    if (storyReply) {
      previewText = `Replied to a story: ${previewText}`;
    } else if (mediaType === 'image') {
      previewText = previewText ? `${previewText} 📷` : '📷 Image';
    } else if (mediaType === 'video') {
      previewText = previewText ? `${previewText} 🎬` : '🎬 Video';
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageSender: senderId,
      lastMessageText: previewText,
      lastMessageTime: new Date(),
      updatedAt: new Date()
    });

    return message;
  }

  static async markMessageAsRead(messageId) {
    return Message.findByIdAndUpdate(
      messageId,
      { read: true, updatedAt: new Date() },
      { new: true }
    ).populate('sender', 'username avatar _id')
     .populate('receiver', 'username avatar _id');
  }

  static async markConversationAsRead(conversationId, userId) {
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        read: false
      },
      {
        read: true,
        updatedAt: new Date()
      }
    );
    return result;
  }

  static async markConversationAsSeen(conversationId, userId) {
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        seen: false
      },
      {
        seen: true,
        seenAt: new Date(),
        updatedAt: new Date()
      }
    );
    return result;
  }

  static async getUnreadCount(userId) {
    return Message.countDocuments({
      receiver: userId,
      read: false
    });
  }

  static async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this message');
    }

    await Message.findByIdAndDelete(messageId);
    return { message: 'Message deleted' };
  }
}


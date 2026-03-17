import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const typingUsers = new Map();

const onlineUsers = new Map();

export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    socket.on('user_join', (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`);
      console.log(`✅ User joined: ${userId}`);
    });

    socket.on('setup', async (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`);
      try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId).select('username avatar _id').lean();
        if (user) {
          onlineUsers.set(String(userId), user);

          socket.broadcast.emit('user_online', { userId, user });

          socket.emit('online_users', { users: Array.from(onlineUsers.values()) });
        }
      } catch (e) {
        onlineUsers.set(String(userId), { _id: userId });
        socket.broadcast.emit('user_online', { userId, user: { _id: userId } });
        socket.emit('online_users', { users: Array.from(onlineUsers.values()) });
      }
    });

    socket.on('get_online_users', () => {
      socket.emit('online_users', { users: Array.from(onlineUsers.values()) });
    });

    socket.on('join_conversation', (data) => {
      const { conversationId, userId } = data;
      socket.conversationId = conversationId;
      socket.join(`conversation_${conversationId}`);
      console.log(`👥 User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (data) => {
      const { conversationId, userId } = data;
      socket.leave(`conversation_${conversationId}`);
      console.log(`👤 User ${userId} left conversation ${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, message, receiverId } = data;

        const savedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar _id')
          .populate('receiver', 'username avatar _id');

        if (savedMessage) {
          io.to(`user_${receiverId}`).emit('message_received', {
            ...savedMessage.toObject(),
            status: 'delivered'
          });

          io.to(`conversation_${conversationId}`).emit('message_new', {
            ...savedMessage.toObject(),
            status: 'sent'
          });

          console.log(`📨 Message sent in conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    socket.on('message_seen', async (data) => {
      try {
        const { conversationId } = data;

        await Message.updateMany(
          { conversationId, receiver: socket.userId, seen: false },
          { seen: true, seenAt: new Date(), status: 'seen' }
        );

        io.to(`conversation_${conversationId}`).emit('messages_seen', {
          conversationId,
          seenBy: socket.userId,
          seenAt: new Date()
        });

        console.log(`✔✔ Messages marked as seen in conversation ${conversationId}`);
      } catch (error) {
        console.error('❌ Error marking messages as seen:', error);
      }
    });

    socket.on('typing_start', (data) => {
      const { conversationId, userName, userId } = data;

      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId).add(userId);

      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        userName,
        conversationId
      });

      console.log(`✍️ ${userName} is typing in ${conversationId}`);
    });

    socket.on('typing_stop', (data) => {
      const { conversationId, userId } = data;

      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
        if (typingUsers.get(conversationId).size === 0) {
          typingUsers.delete(conversationId);
        }
      }

      socket.to(`conversation_${conversationId}`).emit('user_typing_stop', {
        userId,
        conversationId
      });

      console.log(`⏹️ ${userId} stopped typing in ${conversationId}`);
    });

    socket.on('get_unread_count', async (data) => {
      try {
        const { userId } = data;
        const unreadCount = await Message.countDocuments({
          receiver: userId,
          seen: false
        });
        socket.emit('unread_count_updated', { count: unreadCount, timestamp: new Date() });
      } catch (error) {
        console.error('❌ Error getting unread count:', error);
      }
    });

    socket.on('disconnect', () => {
      for (const [, users] of typingUsers.entries()) {
        if (socket.userId) users.delete(socket.userId);
      }
      if (socket.userId) {
        onlineUsers.delete(String(socket.userId));
        io.emit('user_offline', { userId: socket.userId });
      }
      console.log('🔴 Socket disconnected:', socket.id);
    });
  });
};

export default initializeSocketHandlers;

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setSocketInstance } from './config/socketInstance.js';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import storyRoutes from './routes/stories.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import contactRoutes from './routes/contact.js';
import User from './models/User.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.nodeEnv === 'production' ? 'https://yourdomain.com' : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setSocketInstance(io);

app.use(cors({
  origin: config.nodeEnv === 'production' ? 'https://yourdomain.com' : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static('uploads'));

await connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);

  socket.on('setup', async (userId) => {
    userSockets.set(userId, socket.id);
    socket.join(`user_${userId}`); 
    try {

      const user = await User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() }, { new: true });
      console.log(`⚡ User ${userId} is now ONLINE.`);

      socket.broadcast.emit('user_online', { userId });

      const onlineUserIds = Array.from(userSockets.keys());
      socket.emit('online_users', { userIds: onlineUserIds });
    } catch (error) {
      console.error(`Error setting user ${userId} to online:`, error);
    }
  });

  socket.on('user_join', async (userId) => {
    userSockets.set(userId, socket.id);
    socket.join(`user_${userId}`); 
    try {

      const user = await User.findByIdAndUpdate(userId, { isOnline: true, lastActive: new Date() }, { new: true });
      console.log(`⚡ User ${userId} is now ONLINE.`);

      socket.broadcast.emit('user_online', { userId });

      const onlineUserIds = Array.from(userSockets.keys());
      socket.emit('online_users', { userIds: onlineUserIds });
    } catch (error) {
      console.error(`Error setting user ${userId} to online:`, error);
    }
  });

  socket.on('join_conversation', (data) => {
    const { conversationId, userId } = data;
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    const { conversationId, message, receiverId, senderId } = data;

    io.to(`conversation_${conversationId}`).emit('message_received', {
      ...message,
      sender: { _id: senderId },
      receiver: { _id: receiverId }
    });

    const recipientSocket = userSockets.get(receiverId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('message_received', {
        ...message,
        sender: { _id: senderId },
        receiver: { _id: receiverId }
      });
    }

    console.log(`Message sent in conversation ${conversationId} to ${receiverId}`);
  });

  socket.on('typing:start', (data) => {
    const { conversationId, userName, userId, receiverId } = data;

    socket.to(`conversation_${conversationId}`).emit('typing:active', {
      userName,
      userId
    });

    const receiverSocket = userSockets.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_is_typing', { senderId: userId });
    }
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, userId, receiverId } = data;

    socket.to(`conversation_${conversationId}`).emit('typing:inactive', {
      userId
    });

    const receiverSocket = userSockets.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_stopped_typing', { senderId: userId });
    }
  });

  socket.on('post_liked', (data) => {
    const { postAuthorId, notification } = data;
    const recipientSocket = userSockets.get(postAuthorId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('notification', notification);
    }
  });

  socket.on('post_commented', (data) => {
    const { postAuthorId, notification } = data;
    const recipientSocket = userSockets.get(postAuthorId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('notification', notification);
    }
  });

  socket.on('user_followed', (data) => {
    const { followedUserId, notification } = data;
    const recipientSocket = userSockets.get(followedUserId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('notification', notification);
    }
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSockets.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      User.findByIdAndUpdate(disconnectedUserId, { isOnline: false, lastActive: new Date() }).catch(err => console.error(err));
      console.log(`⚡ User ${disconnectedUserId} is now OFFLINE.`);

      io.emit('user_offline', { userId: disconnectedUserId });
    }
    console.log('🔴 User disconnected:', socket.id);
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

httpServer.listen(config.port, () => {
  console.log(`✅ Server running on http://localhost:${config.port}`);
});

export { io, userSockets };


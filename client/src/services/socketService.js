import io from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const socketEmitters = {
  setup: (userId) => socket?.emit('setup', userId),

  joinUser: (userId) => socket?.emit('user_join', userId),

  sendMessage: (conversationId, message) =>
    socket?.emit('send_message', { conversationId, message }),

  notifyLike: (postAuthorId, notification) =>
    socket?.emit('post_liked', { postAuthorId, notification }),

  notifyComment: (postAuthorId, notification) =>
    socket?.emit('post_commented', { postAuthorId, notification }),

  notifyFollow: (followedUserId, notification) =>
    socket?.emit('user_followed', { followedUserId, notification }),

  typing: (conversationId, userName, userId) =>
    socket?.emit('typing_start', { conversationId, userName, userId }),

  stopTyping: (conversationId, userId) =>
    socket?.emit('typing_stop', { conversationId, userId }),
};

export const socketListeners = {
  onMessageReceived: (callback) =>
    socket?.on('message_received', callback),

  onNotification: (callback) =>
    socket?.on('notification', callback),

  onUserOnline: (callback) =>
    socket?.on('user_online', callback),

  onUserOffline: (callback) =>
    socket?.on('user_offline', callback),

  onOnlineUsers: (callback) =>
    socket?.on('online_users', callback),

  onUsersOnline: (callback) =>
    socket?.on('users_online', callback),

  onTyping: (callback) =>
    socket?.on('user_typing', callback),

  onStopTyping: (callback) =>
    socket?.on('user_typing_stop', callback),

  removeListener: (event, callback) =>
    socket?.off(event, callback),
};


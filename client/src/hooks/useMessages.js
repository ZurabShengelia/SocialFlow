

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../services/socketService';

export const useMessages = (conversationId, otherUserId) => {
  const { user } = useAuthStore();
  const {
    currentMessages,
    addTypingUser,
    removeTypingUser,
    updateUserOnlineStatus,
    markConversationAsRead,
    getTypingUsers,
    sendMessage,
  } = useMessageStore();

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const convIdRef = useRef(conversationId);

  useEffect(() => { convIdRef.current = conversationId; }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', { conversationId, userId: user?._id });

    const onTypingStart = (data) => {
      if (data.conversationId === convIdRef.current) {
        addTypingUser(data.conversationId, data.userId, data.userName);
      }
    };

    const onTypingStop = (data) => {
      if (data.conversationId === convIdRef.current) {
        removeTypingUser(data.conversationId, data.userId);
      }
    };

    const onIncomingMessage = (msg) => {
      if (msg.conversationId !== convIdRef.current) return;
      useMessageStore.setState(state => {
        if (state.currentMessages.some(m => m._id === msg._id)) return state;
        return { currentMessages: [...state.currentMessages, msg] };
      });
      markConversationAsRead(convIdRef.current);
    };

    const onUserOnline = ({ userId }) => updateUserOnlineStatus(userId, true);
    const onUserOffline = ({ userId, lastActive }) =>
      updateUserOnlineStatus(userId, false, lastActive ?? new Date().toISOString());
    const onOnlineUsers = (data) => {
      const list = data?.users || data?.userIds || [];
      if (Array.isArray(list)) {
        list.forEach(item => {
          const id = typeof item === 'object' ? item._id : item;
          if (id) updateUserOnlineStatus(id, true);
        });
      }
    };

    socket.on('message_received', onIncomingMessage);
    socket.on('typing:active', onTypingStart);
    socket.on('typing:inactive', onTypingStop);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);
    socket.on('online_users', onOnlineUsers);

    return () => {
      socket.emit('leave_conversation', { conversationId, userId: user?._id });
      socket.off('message_received', onIncomingMessage);
      socket.off('typing:active', onTypingStart);
      socket.off('typing:inactive', onTypingStop);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      socket.off('online_users', onOnlineUsers);
    };
  }, [conversationId, user?._id]);

  const handleSend = useCallback(async (text, file) => {
    if (!conversationId || (!text?.trim() && !file)) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendMessage(conversationId, text, file);
      socketRef.current?.emit('send_message', {
        conversationId,
        message: msg,
        receiverId: otherUserId,
        senderId: user?._id,
      });
      socketRef.current?.emit('typing:stop', {
        conversationId,
        userId: user?._id,
        receiverId: otherUserId,
      });
      return msg;
    } catch (err) {
      console.error('Send error:', err);
      setSendError('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [conversationId, otherUserId, user?._id, sendMessage]);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;
    socketRef.current?.emit('typing:start', {
      conversationId,
      userName: user?.username,
      userId: user?._id,
      receiverId: otherUserId,
    });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', {
        conversationId,
        userId: user?._id,
        receiverId: otherUserId,
      });
    }, 2500);
  }, [conversationId, otherUserId, user]);

  const typingList = conversationId ? (getTypingUsers?.(conversationId) ?? []) : [];

  return {
    messages: currentMessages,
    sending,
    sendError,
    typingList,
    handleSend,
    handleTyping,
  };
};


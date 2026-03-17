

import { create } from 'zustand';
import { messageAPI } from '../services/apiService';

export const useMessageStore = create((set, get) => ({

  conversations: [],
  currentConversation: null,
  currentMessages: [],
  currentConversationId: null,

  unreadCounts: {}, 
  totalUnreadCount: 0, 

  onlineUsers: new Set(), 
  userLastActive: {}, 

  typingUsers: {}, 

  loading: false,
  error: null,

  createConversation: async (participantId) => {
    try {
      const { data } = await messageAPI.createConversation(participantId);
      const newConv = data.data;

      const existing = get().conversations.find(
        c => c.otherUser?._id === newConv.otherUser?._id
      );

      if (!existing) {
        set(state => ({
          conversations: [newConv, ...state.conversations]
        }));
      }

      return newConv;
    } catch (error) {
      console.error('❌ Conversation creation error:', error);
      throw error;
    }
  },

  getConversations: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await messageAPI.getConversations();

      const seen = new Set();
      const unique = data.data.filter(conv => {
        const otherId = conv.otherUser?._id;
        if (seen.has(otherId)) return false;
        seen.add(otherId);
        return true;
      });

      set({ conversations: unique, loading: false });
      return unique;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch conversations';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  selectConversation: async (conversationId) => {
    if (!conversationId) return;

    set({ 
      loading: true, 
      currentConversationId: conversationId 
    });

    try {

      const { data } = await messageAPI.getConversationMessages(conversationId, 1);
      const messages = Array.isArray(data.data) ? data.data : [];

      set({ 
        currentMessages: messages,
        currentConversationId: conversationId,
        loading: false 
      });

      get().markConversationAsRead(conversationId).catch(err => {
        console.error('Failed to mark as read:', err);
      });

      return messages;
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch messages',
        loading: false 
      });
      throw error;
    }
  },

  getConversationMessages: async (conversationId, page = 1) => {
    return get().selectConversation(conversationId);
  },

  sendMessage: async (conversationId, text, file) => {
    if (!conversationId || (!text?.trim() && !file)) {
      throw new Error('Conversation ID and message content required');
    }

    try {
      const { data } = await messageAPI.sendMessage(conversationId, text || '', file);
      const message = data.data;

      if (conversationId === get().currentConversationId) {
        set(state => ({
          currentMessages: [...state.currentMessages, message]
        }));
      }

      return message;
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  },

  addMessage: (message) => {
    if (!message || !message._id || !message.conversationId) {
      console.warn('⚠️ Invalid message:', message);
      return;
    }

    const { currentConversationId, currentMessages } = get();

    if (message.conversationId !== currentConversationId) {
      return;
    }

    if (currentMessages.some(m => m._id === message._id)) {
      return;
    }

    set(state => ({
      currentMessages: [...state.currentMessages, message]
    }));
  },

  deleteMessage: async (messageId) => {
    try {
      await messageAPI.deleteMessage(messageId);
      set(state => ({
        currentMessages: state.currentMessages.filter(m => m._id !== messageId)
      }));
    } catch (error) {
      console.error('❌ Delete message error:', error);
      throw error;
    }
  },

  getUnreadMessageCount: async () => {
    try {
      const { data } = await messageAPI.getUnreadCount();
      const count = data?.data?.count ?? 0;

      set({ totalUnreadCount: Math.max(0, count) });
      return count;
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
      return 0;
    }
  },

  incrementUnread: () => {
    set(state => ({
      totalUnreadCount: state.totalUnreadCount + 1
    }));
  },

  setUnreadMessageCount: (count = 0) => {
    set({ totalUnreadCount: Math.max(0, count) });
  },

  markConversationAsRead: async (conversationId) => {
    try {

      set(state => ({
        unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
        totalUnreadCount: Math.max(0, state.totalUnreadCount - (state.unreadCounts[conversationId] || 0))
      }));

      set(state => ({
        currentMessages: state.currentMessages.map(msg =>
          msg.conversationId === conversationId 
            ? { ...msg, seen: true, status: 'seen' }
            : msg
        )
      }));

      await messageAPI.markAsRead(conversationId);

      await get().getUnreadMessageCount();
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);

    }
  },

  updateUnreadCount: (conversationId, count) => {
    const newCount = Math.max(0, count);
    set(state => {
      const newCounts = { ...state.unreadCounts, [conversationId]: newCount };
      const total = Object.values(newCounts).reduce((a, b) => a + b, 0);
      return {
        unreadCounts: newCounts,
        totalUnreadCount: total
      };
    });
  },

  setUserOnline: (userId) => {
    set(state => {
      const newOnline = new Set(state.onlineUsers);
      newOnline.add(userId);
      return { onlineUsers: newOnline };
    });

    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.otherUser?._id === userId
          ? {
              ...conv,
              otherUser: {
                ...conv.otherUser,
                isOnline: true,
                lastActive: null
              }
            }
          : conv
      )
    }));
  },

  setUserOffline: (userId, lastActive) => {
    set(state => {
      const newOnline = new Set(state.onlineUsers);
      newOnline.delete(userId);
      return { 
        onlineUsers: newOnline,
        userLastActive: { ...state.userLastActive, [userId]: lastActive }
      };
    });

    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.otherUser?._id === userId
          ? {
              ...conv,
              otherUser: {
                ...conv.otherUser,
                isOnline: false,
                lastActive
              }
            }
          : conv
      )
    }));
  },

  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId);
  },

  updateUserOnlineStatus: (userId, isOnline, lastActive = null) => {
    if (isOnline) {
      get().setUserOnline(userId);
    } else {
      get().setUserOffline(userId, lastActive);
    }
  },

  addTypingUser: (conversationId, userId, userName) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: {
          ...(state.typingUsers[conversationId] || {}),
          [userId]: { userName, timestamp: Date.now() }
        }
      }
    }));
  },

  removeTypingUser: (conversationId, userId) => {
    set(state => {
      const convTyping = { ...state.typingUsers[conversationId] };
      delete convTyping[userId];

      return {
        typingUsers: Object.keys(convTyping).length > 0
          ? { ...state.typingUsers, [conversationId]: convTyping }
          : { ...state.typingUsers, [conversationId]: {} }
      };
    });
  },

  clearTypingUsers: (conversationId) => {
    set(state => ({
      typingUsers: { ...state.typingUsers, [conversationId]: {} }
    }));
  },

  getTypingUsers: (conversationId) => {
    const typing = get().typingUsers[conversationId] || {};
    return Object.values(typing).map(u => u.userName);
  },

  clearMessages: () => {
    set({
      currentMessages: [],
      currentConversationId: null,
      typingUsers: {}
    });
  },

  clearError: () => set({ error: null }),

  logState: () => {
    const state = get();
    console.log({
      totalUnreadCount: state.totalUnreadCount,
      unreadCounts: state.unreadCounts,
      conversationCount: state.conversations.length,
      onlineUserCount: state.onlineUsers.size,
      currentMessages: state.currentMessages.length,
      typingUsers: state.typingUsers
    });
  }
}));

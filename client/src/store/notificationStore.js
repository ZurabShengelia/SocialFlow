import { create } from 'zustand';
import { notificationAPI } from '../services/apiService';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  getNotifications: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const { data } = await notificationAPI.getNotifications(page);
      set({
        notifications: page === 1 ? data.data : [...get().notifications, ...data.data],
        loading: false
      });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch notifications', loading: false });
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      set({ unreadCount: data.data.count || 0 });
      return data.data.count;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      set((state) => {
        const notification = state.notifications.find((n) => n._id === notificationId);
        return {
          notifications: state.notifications.filter((n) => n._id !== notificationId),
          unreadCount: !notification?.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));


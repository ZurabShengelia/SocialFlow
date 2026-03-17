import { create } from 'zustand';
import { userAPI } from '../services/apiService';
import { useAuthStore } from './authStore';

export const useUserStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  followers: [],
  following: [],
  onlineUsers: {},
  loading: false,
  error: null,

  getProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await userAPI.getProfile(userId);
      set({ selectedUser: data.data, loading: false });

      if (data.data?.isOnline) {
        get().setUserOnline(data.data._id);
      }
      return data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch profile';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await userAPI.updateProfile(profileData);
      set({ selectedUser: data.data, loading: false });

      useAuthStore.getState().updateUser(data.data);
      return data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: null });
    try {
      const { data } = await userAPI.uploadAvatar(file);
      set({ selectedUser: data.data, loading: false });
      return data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload avatar';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  follow: async (userId) => {
    try {
      const { data } = await userAPI.follow(userId);
      const result = data.data; 

      const updatedUser = result.following;       
      const updatedCurrentUser = result.follower; 

      set({ selectedUser: updatedUser });

      useAuthStore.getState().updateUser(updatedCurrentUser);

      return { user: updatedUser, status: result.status };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to follow user';
      console.error('Follow error:', msg);
      throw new Error(msg);
    }
  },

  unfollow: async (userId) => {
    try {
      const { data } = await userAPI.unfollow(userId);
      const result = data.data; 

      const updatedUser = result.following;
      const updatedCurrentUser = result.follower;

      set({ selectedUser: updatedUser });
      useAuthStore.getState().updateUser(updatedCurrentUser);

      return updatedUser;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to unfollow user';
      console.error('Unfollow error:', msg);
      throw new Error(msg);
    }
  },

  searchUsers: async (query) => {
    set({ loading: true, error: null });
    try {
      const { data } = await userAPI.searchUsers(query);
      set({ users: data.data, loading: false });
      return data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Search failed';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  clearSearch: () => set({ users: [] }),
  clearError: () => set({ error: null }),

  setUserOnline: (userId) => {
    set(state => ({
      onlineUsers: { ...state.onlineUsers, [userId]: true }
    }));
  },

  setUserOffline: (userId) => {
    set(state => ({
      onlineUsers: { ...state.onlineUsers, [userId]: false }
    }));
  },

  setOnlineUsers: (userIds) => {
    const onlineUsers = {};
    userIds.forEach(userId => {
      onlineUsers[userId] = true;
    });
    set({ onlineUsers });
  },

  isUserOnline: (userId) => get().onlineUsers[userId] === true,

  updateSelectedUserOnlineStatus: (isOnline) => {
    set(state => ({
      selectedUser: state.selectedUser ? { ...state.selectedUser, isOnline } : null
    }));
  },
}));


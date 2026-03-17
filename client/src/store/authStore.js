import { create } from 'zustand';
import { authAPI, userAPI } from '../services/apiService';

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(username, email, password);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, token: data.data.token, loading: false });
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  getMe: async () => {
    set({ loading: true });
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data, loading: false });
      return data.data;
    } catch (error) {
      set({ loading: false, error: 'Failed to fetch user' });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: null });
    try {
      const { data } = await userAPI.uploadAvatar(file);
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data, loading: false });
      return data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to upload avatar',
        loading: false,
      });
      throw error;
    }
  },

  blockUser: async (userId) => {

    set(state => {
      const current = state.user;
      if (!current) return state;
      const alreadyBlocked = (current.blockedUsers || []).some(
        b => (b._id || b) === userId
      );
      if (alreadyBlocked) return state;
      const updated = {
        ...current,
        blockedUsers: [...(current.blockedUsers || []), { _id: userId }],
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
    try {
      const { data } = await userAPI.blockUser(userId);

      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data });
      return data.data;
    } catch (error) {

      set(state => {
        const current = state.user;
        if (!current) return state;
        const rolled = {
          ...current,
          blockedUsers: (current.blockedUsers || []).filter(
            b => (b._id || b) !== userId
          ),
        };
        localStorage.setItem('user', JSON.stringify(rolled));
        return { user: rolled, error: error.response?.data?.message || 'Failed to block user' };
      });
      throw error;
    }
  },

  unblockUser: async (userId) => {

    set(state => {
      const current = state.user;
      if (!current) return state;
      const updated = {
        ...current,
        blockedUsers: (current.blockedUsers || []).filter(
          b => (b._id || b) !== userId
        ),
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
    try {
      const { data } = await userAPI.unblockUser(userId);
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data });
      return data.data;
    } catch (error) {

      set(state => {
        const current = state.user;
        if (!current) return state;
        const rolled = {
          ...current,
          blockedUsers: [...(current.blockedUsers || []), { _id: userId }],
        };
        localStorage.setItem('user', JSON.stringify(rolled));
        return { user: rolled, error: error.response?.data?.message || 'Failed to unblock user' };
      });
      throw error;
    }
  },

  isUserBlocked: (userId) => {
    const state = useAuthStore.getState();
    if (!state.user || !state.user.blockedUsers) return false;
    return state.user.blockedUsers.some(
      (blockedUser) =>
        blockedUser._id === userId || blockedUser === userId
    );
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  clearError: () => set({ error: null }),
}));


import { create } from 'zustand';
import { postAPI, commentAPI } from '../services/apiService';

export const usePostStore = create((set, get) => ({
  posts: [],
  feed: [],
  savedPosts: [],
  loading: false,
  error: null,

  createPost: async (formData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await postAPI.createPost(formData);
      set({
        feed: [data.data, ...get().feed],
        loading: false
      });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create post', loading: false });
      throw error;
    }
  },

  getFeed: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const { data } = await postAPI.getFeed(page);
      set({
        feed: page === 1 ? data.data : [...get().feed, ...data.data],
        loading: false
      });
      return data.data;
    } catch (error) {
      set(state => ({
        error: error.response?.data?.message || 'Failed to fetch feed',
        loading: false,
        feed: state.feed
      }));
    }
  },

  getUserPosts: async (userId, page = 1) => {
    set({ loading: true, error: null });
    try {
      const { data } = await postAPI.getUserPosts(userId, page);
      set({
        posts: page === 1 ? data.data : [...get().posts, ...data.data],
        loading: false
      });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch posts', loading: false });
      throw error;
    }
  },

  likePost: async (postId) => {
    try {
      const { data } = await postAPI.likePost(postId);
      set({
        feed: get().feed.map(p => p._id === postId ? data.data : p),
        posts: get().posts.map(p => p._id === postId ? data.data : p)
      });
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  unlikePost: async (postId) => {
    try {
      const { data } = await postAPI.unlikePost(postId);
      set({
        feed: get().feed.map(p => p._id === postId ? data.data : p),
        posts: get().posts.map(p => p._id === postId ? data.data : p)
      });
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await postAPI.deletePost(postId);
      set({
        feed: get().feed.filter(p => p._id !== postId),
        posts: get().posts.filter(p => p._id !== postId)
      });
    } catch (error) {
      throw error;
    }
  },

  savePost: async (postId) => {
    try {
      await postAPI.savePost(postId);
      set(state => ({
        savedPosts: state.savedPosts.some(p => (p._id || p) === postId)
          ? state.savedPosts
          : [...state.savedPosts, postId],
        feed: state.feed.map(p => p._id === postId ? { ...p, isSaved: true } : p),
        posts: state.posts.map(p => p._id === postId ? { ...p, isSaved: true } : p),
      }));
    } catch (error) {
      throw error;
    }
  },

  unsavePost: async (postId) => {
    try {
      await postAPI.unsavePost(postId);
      set(state => ({
        savedPosts: state.savedPosts.filter(p => (p._id || p) !== postId),
        feed: state.feed.map(p => p._id === postId ? { ...p, isSaved: false } : p),
        posts: state.posts.map(p => p._id === postId ? { ...p, isSaved: false } : p),
      }));
    } catch (error) {
      throw error;
    }
  },

  getSavedPosts: async () => {
    set({ loading: true });
    try {
      const { data } = await postAPI.getSavedPosts();
      set({ savedPosts: data.data, loading: false });
      return data.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearPosts: () => set({ posts: [], feed: [] }),
  clearError: () => set({ error: null }),
}));

export const useCommentStore = create((set, get) => ({
  comments: [],
  loading: false,
  error: null,

  getPostComments: async (postId, page = 1) => {
    set({ loading: true, error: null });
    try {
      const { data } = await commentAPI.getPostComments(postId, page);
      set({
        comments: page === 1 ? data.data : [...get().comments, ...data.data],
        loading: false
      });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch comments', loading: false });
      throw error;
    }
  },

  createComment: async (postId, text) => {
    try {
      const { data } = await commentAPI.createComment(postId, text);
      set({ comments: [data.data, ...get().comments] });
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      set({ comments: get().comments.filter(c => c._id !== commentId) });
    } catch (error) {
      throw error;
    }
  },

  clearComments: () => set({ comments: [] }),
  clearError: () => set({ error: null }),
}));


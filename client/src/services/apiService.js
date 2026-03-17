import API from './api';

export const authAPI = {
  register: (username, email, password) =>
    API.post('/auth/register', { username, email, password }),

  verifyEmail: (userId, code) =>
    API.post('/auth/verify-email', { userId, code }),

  resendVerificationCode: (email) =>
    API.post('/auth/resend-verification', { email }),

  login: (email, password) =>
    API.post('/auth/login', { email, password }),

  getMe: () => API.get('/auth/me'),

  requestVerificationCode: (data) =>
    API.post('/auth/request-code', data),

  verifyAndUpdate: (data) =>
    API.post('/auth/verify-update', data),

  getBlockedUsers: () => API.get('/auth/blocked-users'),
};

export const userAPI = {
  getProfile: (userId) =>
    API.get(`/auth/user/${userId}`),

  updateProfile: (data) =>
    API.put('/auth/profile', data),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return API.post('/auth/upload-avatar', formData);
  },

  follow: (userId) => API.post(`/auth/follow/${userId}`),

  unfollow: (userId) => API.post(`/auth/unfollow/${userId}`),

  getFollowRequests: () => API.get('/auth/follow-requests'),

  acceptFollowRequest: (requesterId) =>
    API.post('/auth/follow-requests/accept', { requesterId }),

  rejectFollowRequest: (requesterId) =>
    API.post('/auth/follow-requests/reject', { requesterId }),

  blockUser: (userId) => API.post(`/auth/block/${userId}`),

  unblockUser: (userId) => API.post(`/auth/unblock/${userId}`),

  searchUsers: (query) =>
    API.get('/auth/search', { params: { q: query } }),
};

export const postAPI = {
  createPost: (formData) =>
    API.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getFeed: (page = 1) =>
    API.get('/posts/feed', { params: { page } }),

  getExplore: (page = 1) =>
    API.get('/posts/explore', { params: { page } }),

  getUserPosts: (userId, page = 1) =>
    API.get(`/posts/user/${userId}`, { params: { page } }),

  getPost: (postId) => API.get(`/posts/${postId}`),

  deletePost: (postId) => API.delete(`/posts/${postId}`),

  likePost: (postId) => API.post(`/posts/${postId}/like`),

  unlikePost: (postId) => API.post(`/posts/${postId}/unlike`),

  savePost: (postId) => API.post(`/posts/${postId}/save`),

  unsavePost: (postId) => API.post(`/posts/${postId}/unsave`),

  getSavedPosts: () => API.get('/posts/saved'),

  getPostsByHashtag: (hashtag, page = 1) =>
    API.get(`/posts/hashtag/${encodeURIComponent(hashtag)}`, { params: { page } }),

  getTrendingHashtags: (limit = 8) =>
    API.get('/posts/trending-hashtags', { params: { limit } }),
};

export const commentAPI = {
  createComment: (postId, text) =>
    API.post(`/posts/${postId}/comments`, { text }),

  getPostComments: (postId, page = 1) =>
    API.get(`/posts/${postId}/comments`, { params: { page } }),

  deleteComment: (commentId) =>
    API.delete(`/posts/comment/${commentId}`),

  likeComment: (commentId) =>
    API.post(`/posts/comment/${commentId}/like`),

  unlikeComment: (commentId) =>
    API.delete(`/posts/comment/${commentId}/unlike`),
};

export const storyAPI = {
  createStory: (file, text, backgroundColor) => {
    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('text', text || '');
    formData.append('backgroundColor', backgroundColor || '#ffffff');
    return API.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getUserStories: (userId) => API.get(`/stories/user/${userId}`),
  getFollowingStories: () => API.get('/stories/following'),
  viewStory: (storyId) => API.post(`/stories/${storyId}/view`),
  reactToStory: (storyId, emoji) => API.post(`/stories/${storyId}/react`, { emoji }),
  removeReaction: (storyId) => API.post(`/stories/${storyId}/unreact`),
  replyToStory: (storyId, text) => API.post(`/stories/${storyId}/reply`, { text }),
  deleteStory: (storyId) => API.delete(`/stories/${storyId}`),
};

export const messageAPI = {
  createConversation: (participantId, initialMessage = null) =>
    API.post('/messages/conversations/create', { participantId, initialMessage }),

  getConversations: () => API.get('/messages/conversations'),

  getMessages: (conversationId, page = 1) =>
    API.get(`/messages/conversations/${conversationId}`, { params: { page } }),

  getConversationMessages: (conversationId, page = 1) =>
    API.get(`/messages/conversations/${conversationId}`, { params: { page } }),

  sendMessage: (conversationId, text, mediaFile = null) => {
    if (mediaFile) {
      const formData = new FormData();
      if (text) formData.append('text', text);
      formData.append('file', mediaFile);
      return API.post(`/messages/conversations/${conversationId}/send`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return API.post(`/messages/conversations/${conversationId}/send`, { text });
  },

  deleteMessage: (conversationId, messageId) =>
    API.delete(`/messages/conversations/${conversationId}/message/${messageId}`),

  markAsRead: (conversationId) =>
    API.put(`/messages/conversations/${conversationId}/read`),

  markConversationAsSeen: (conversationId) =>
    API.put(`/messages/conversations/${conversationId}/read`),

  getUnreadCount: () => API.get('/messages/unread-count'),
};

export const notificationAPI = {
  getNotifications: (page = 1) =>
    API.get('/notifications', { params: { page } }),

  getUnreadCount: () => API.get('/notifications/unread/count'),

  markAsRead: (notificationId) =>
    API.put(`/notifications/${notificationId}/read`),

  markAllAsRead: () => API.put('/notifications/read/all'),

  deleteNotification: (notificationId) =>
    API.delete(`/notifications/${notificationId}`),
};

export const apiService = {
  authAPI,
  userAPI,
  postAPI,
  commentAPI,
  storyAPI,
  messageAPI,
  notificationAPI,
};


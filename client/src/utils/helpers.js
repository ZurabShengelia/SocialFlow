
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const buildMediaUrl = (mediaPath) => {
  if (!mediaPath) return '';

  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }

  let normalizedPath = mediaPath.replace(/\\/g, '/');

  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  const url = `http://localhost:5000${normalizedPath}`;

  return url.replace(/([^:]\/)\/+/g, '$1');
};

export const getAvatarBgColor = (username) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const isUserOnline = (lastSeen) => {
  const now = new Date();
  const diffInMinutes = (now - new Date(lastSeen)) / (1000 * 60);
  return diffInMinutes < 5;
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const getUserActiveStatus = (user) => {
  if (!user) return 'Offline';

  if (user.isOnline === true) {
    return 'Active Now';
  }

  if (user.lastActive) {
    return `Last active ${formatTimeAgo(user.lastActive)}`;
  }

  if (user.createdAt) {
    return 'Offline';
  }

  return 'Offline';
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


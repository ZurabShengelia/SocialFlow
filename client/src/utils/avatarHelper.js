export const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 150 150%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22150%22 height=%22150%22/%3E%3Ccircle cx=%2275%22 cy=%2250%22 r=%2222%22 fill=%22%239ca3af%22/%3E%3Cpath d=%22M 30 130 Q 30 95 75 95 Q 120 95 120 130 L 120 150 L 30 150 Z%22 fill=%22%239ca3af%22/%3E%3C/svg%3E';

export const getAvatarUrl = (avatar) => {

  if (!avatar || avatar === 'null' || avatar === '') return DEFAULT_AVATAR;

  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;

  if (avatar.startsWith('/')) return `http://localhost:5000${avatar}`;

  return `http://localhost:5000/uploads/${avatar}`;
};



import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarHelper';
import { OnlineIndicator } from './OnlineIndicator';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export const ConversationItem = ({
  conversation,
  isSelected,
  unreadCount,
  onClick,
  darkMode,
}) => {
  const other = conversation.otherUser;
  const hasUnread = unreadCount > 0;
  const timeStr = formatTime(conversation.lastMessageTime || conversation.updatedAt);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: darkMode ? 'rgba(51,65,85,0.5)' : 'rgba(248,250,252,1)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.12 }}
      className={`
        w-full text-left flex items-center gap-3 px-3 py-4 rounded-xl
        transition-colors duration-150
        ${isSelected
          ? darkMode
            ? 'bg-slate-700/70'
            : 'bg-slate-100'
          : ''
        }
      `}
    >
      {}
      <div className="relative flex-shrink-0">
        <img
          src={getAvatarUrl(other?.avatar)}
          alt={other?.username ?? 'User'}
          className={`w-12 h-12 rounded-full object-cover ${
            isSelected ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
          }`}
          onError={e => { e.target.src = DEFAULT_AVATAR; }}
        />
        {other?.isOnline && (
          <span className="absolute bottom-0 right-0">
            <OnlineIndicator
              isOnline={true}
              size="sm"
              ringColor={darkMode ? 'dark' : 'light'}
              pulse={true}
            />
          </span>
        )}
      </div>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-base truncate leading-tight ${
            hasUnread
              ? darkMode ? 'text-white font-bold' : 'text-slate-900 font-bold'
              : darkMode ? 'text-slate-200 font-semibold' : 'text-slate-800 font-semibold'
          }`}>
            {other?.username}
          </p>
          <span className={`text-xs flex-shrink-0 ${
            hasUnread
              ? 'text-indigo-500 font-semibold'
              : darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {timeStr}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={`text-[13px] truncate leading-snug ${
            hasUnread
              ? darkMode ? 'text-slate-200 font-medium' : 'text-slate-700 font-medium'
              : darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {conversation.lastMessageText || 'No messages yet'}
          </p>

          {}
          <AnimatePresence mode="wait">
            {hasUnread && (
              <motion.span
                key={`badge-${unreadCount}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-indigo-500 text-white
                           text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
};

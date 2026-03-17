

import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeAgo } from '../../utils/helpers';

export const UserStatus = ({ isOnline, lastActive, isTyping = false, className = '' }) => {
  const getText = () => {
    if (isTyping) return null; 
    if (isOnline) return 'Active now';
    if (lastActive) {
      const ago = formatTimeAgo(lastActive);
      if (ago && ago !== 'just now') return `Last seen ${ago}`;
    }
    return 'Offline';
  };

  const getColor = () => {
    if (isTyping) return 'text-indigo-400';
    if (isOnline) return 'text-emerald-500';
    return 'text-slate-400 dark:text-slate-500';
  };

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${getColor()} ${className}`}>
      <AnimatePresence mode="wait">
        {isTyping ? (
          <motion.span
            key="typing"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="flex items-center gap-1"
          >
            <span>typing</span>
            <span className="flex items-end gap-[2px] mb-[1px]">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="inline-block w-[3px] h-[3px] rounded-full bg-indigo-400"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1"
          >
            {isOnline && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            )}
            {getText()}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TypingIndicator = ({ users = [] }) => {
  return (
    <AnimatePresence>
      {users && users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-slate-400 block"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 italic">
            {users.length === 1
              ? `${users[0]} is typing`
              : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing`}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;


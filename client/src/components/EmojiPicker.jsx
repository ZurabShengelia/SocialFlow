import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'],
  hand: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎'],
  heart: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💝'],
  fire: ['🔥', '✨', '⭐', '🌟', '💫', '🌠', '☄️', '💥', '🎉', '🎊', '🎈', '🎆', '🎇', '💒', '🎁', '🏆'],
  thumbs: ['👏', '🙌', '👐', '🤲', '🤝', '🤜', '🤛', '✊', '👊', '🦵', '🦶', '👂', '👃', '🧠', '🦷', '🦴'],
};

const CATEGORY_ICONS = {
  smileys: '😊',
  hand: '👋',
  heart: '❤️',
  fire: '🔥',
  thumbs: '👍',
};

const EmojiPicker = ({ onEmojiSelect }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs border border-gray-200 dark:border-gray-700"
    >
      {}
      <div className="flex gap-1 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <motion.button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 p-2 rounded-lg transition ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
          >
            {CATEGORY_ICONS[category]}
          </motion.button>
        ))}
      </div>

      {}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-8 gap-1"
        >
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <motion.button
              key={`${activeCategory}-${index}`}
              type="button"
              onClick={() => onEmojiSelect(emoji)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer text-center aspect-square flex items-center justify-center"
              title={emoji}
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default EmojiPicker;


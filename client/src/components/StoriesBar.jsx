import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoryStore } from '../store/storyStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getAvatarUrl } from '../utils/avatarHelper';
import { FiPlus } from 'react-icons/fi';

export const StoriesBar = ({ onAddStoryClick, onStoryClick }) => {
  const { getAllStories } = useStoryStore();
  const { user } = useAuthStore();
  const { darkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [userStoryGroups, setUserStoryGroups] = useState([]);

  useEffect(() => { loadStories(); }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const organizedStories = await getAllStories(user?._id);
      setUserStoryGroups(organizedStories);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasUnseenStories = (stories) =>
    stories.some((story) => !story.views?.some((v) => v.viewer?._id === user?._id));

  if (loading && userStoryGroups.length === 0) {
    return (
      <div className={`flex gap-3 p-3 sm:p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full animate-pulse flex-shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-3 sm:p-4 mb-4 flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide ${
        darkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
      }`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddStoryClick}
        className="flex-shrink-0 flex flex-col items-center"
        title="Add Story"
      >
        <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 flex items-center justify-center ring-2 ring-offset-2 transition-all duration-200 ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-600 ring-slate-600 ring-offset-slate-800'
            : 'bg-gray-100 hover:bg-gray-200 ring-gray-300 ring-offset-white'
        }`}>
          <motion.div whileHover={{ scale: 1.2 }}
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all ${
              darkMode ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
            <FiPlus size={18} className="text-primary" />
          </motion.div>
        </div>
        <span className={`text-[10px] sm:text-xs font-semibold text-center mt-1.5 w-14 sm:w-16 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Your Story
        </span>
      </motion.button>

      {}
      {userStoryGroups.length > 0 ? (
        userStoryGroups.map((group, index) => {
          const isUnseen = hasUnseenStories(group.stories);
          const isOwnStory = group.isOwn;
          return (
            <motion.button
              key={`${group.user?._id}-${index}`}
              onClick={() => onStoryClick(userStoryGroups, index)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center focus:outline-none"
              title={`${group.user?.username}'s stories`}
            >
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 ${
                isUnseen
                  ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-red-400 ring-2 ring-offset-2 ring-purple-400/50'
                  : 'bg-gray-400'
              }`}>
                <img
                  src={getAvatarUrl(group.user?.avatar)}
                  alt={group.user?.username}
                  className="w-full h-full rounded-full border-2 sm:border-4 border-white dark:border-slate-900 object-cover"
                  onError={(e) => { e.target.src = getAvatarUrl(null); }}
                />
              </div>
              <p className={`text-[10px] sm:text-xs font-semibold text-center mt-1.5 truncate w-14 sm:w-16 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {isOwnStory ? 'Your Stories' : group.user?.username}
              </p>
            </motion.button>
          );
        })
      ) : (
        <div className={`flex-1 text-center py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No stories available
        </div>
      )}
    </motion.div>
  );
};


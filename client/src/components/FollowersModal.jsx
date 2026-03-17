import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

export const FollowersModal = ({ isOpen, onClose, followers = [], targetUserId }) => {
  const { darkMode } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const { follow, unfollow } = useUserStore();
  const [followingState, setFollowingState] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (currentUser && followers) {
      const state = {};
      followers.forEach(follower => {
        state[follower._id] = currentUser.following?.includes(follower._id) || false;
      });
      setFollowingState(state);
    }
  }, [followers, currentUser]);

  const handleFollowToggle = async (userId) => {
    if (userId === currentUser._id) return;

    setLoading(prev => ({ ...prev, [userId]: true }));
    try {
      if (followingState[userId]) {
        await unfollow(userId);
        setFollowingState(prev => ({ ...prev, [userId]: false }));
      } else {
        await follow(userId);
        setFollowingState(prev => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl border w-full max-w-md max-h-96 flex flex-col ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
            }`}
          >
            {}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              darkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Followers
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`p-2 rounded-lg transition ${
                  darkMode
                    ? 'hover:bg-slate-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FiX size={20} />
              </motion.button>
            </div>

            {}
            <div className="overflow-y-auto flex-1">
              {followers && followers.length > 0 ? (
                <div className="divide-y" style={{
                  divideColor: darkMode ? 'rgb(51, 65, 85)' : 'rgb(229, 231, 235)'
                }}>
                  {followers.map((follower, index) => (
                    <motion.div
                      key={follower._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className={`px-6 py-4 flex items-center justify-between hover:${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} transition`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={getAvatarUrl(follower.avatar)}
                          alt={follower.username}
                          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {follower.username}
                          </p>
                          {follower.bio && (
                            <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {follower.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {}
                      {currentUser?._id !== follower._id && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFollowToggle(follower._id)}
                          disabled={loading[follower._id]}
                          className={`ml-2 px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap flex-shrink-0 ${
                            followingState[follower._id]
                              ? darkMode
                                ? 'bg-slate-700 text-white hover:bg-slate-600'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                              : 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-lg'
                          } ${loading[follower._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {followingState[follower._id] ? 'Following' : 'Follow'}
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No followers yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowersModal;


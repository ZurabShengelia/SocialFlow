import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

const getFollowState = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return 'none';

  const targetId = targetUser._id?.toString();

  const isFollowing = (currentUser.following || []).some(
    (f) => (f._id || f)?.toString() === targetId
  );
  if (isFollowing) return 'following';

  const hasRequested = (targetUser.followRequests || []).some(
    (r) => (r._id || r)?.toString() === currentUser._id?.toString()
  );
  if (hasRequested) return 'requested';

  return 'none';
};

export const FollowingModal = ({ isOpen, onClose, following = [], targetUserId }) => {
  const { darkMode } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const { follow, unfollow } = useUserStore();

  const [followStates, setFollowStates] = useState({});
  const [loading, setLoading] = useState({});
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!currentUser || !following.length) return;
    const states = {};
    following.forEach((u) => {
      states[u._id] = getFollowState(currentUser, u);
    });
    setFollowStates(states);
  }, [following, currentUser]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleFollowToggle = async (targetUser) => {
    const userId = targetUser._id;
    if (userId === currentUser?._id) return;

    const currentState = followStates[userId] || 'none';
    setLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      if (currentState === 'following') {

        await unfollow(userId);
        setFollowStates((prev) => ({ ...prev, [userId]: 'none' }));
      } else if (currentState === 'requested') {

        await unfollow(userId);
        setFollowStates((prev) => ({ ...prev, [userId]: 'none' }));
      } else {

        const result = await follow(userId);
        setFollowStates((prev) => ({
          ...prev,
          [userId]: result.status === 'requested' ? 'requested' : 'following',
        }));
        if (result.status === 'requested') {
          showToast(`Follow request sent to @${targetUser.username}`);
        }
      }
    } catch (error) {
      showToast(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getButtonConfig = (state) => {
    switch (state) {
      case 'following':
        return { label: 'Following', style: 'bg-gray-200 text-gray-900 dark:bg-slate-700 dark:text-white' };
      case 'requested':
        return { label: 'Requested', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
      default:
        return { label: 'Follow', style: 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl border w-full max-w-md max-h-96 flex flex-col ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
            }`}
          >
            {}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Following
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`p-2 rounded-lg transition ${
                  darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FiX size={20} />
              </motion.button>
            </div>

            {}
            <AnimatePresence>
              {toastMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 mt-3 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm text-center"
                >
                  {toastMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {}
            <div className="overflow-y-auto flex-1">
              {following && following.length > 0 ? (
                <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
                  {following.map((followedUser, index) => {
                    const state = followStates[followedUser._id] || 'none';
                    const btnConfig = getButtonConfig(state);
                    const isLoading = loading[followedUser._id];
                    const isSelf = currentUser?._id === followedUser._id;

                    return (
                      <motion.div
                        key={followedUser._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`px-6 py-4 flex items-center justify-between transition ${
                          darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={getAvatarUrl(followedUser.avatar)}
                            alt={followedUser.username}
                            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {followedUser.username}
                            </p>
                            {followedUser.bio && (
                              <p className="text-xs text-gray-500 truncate">{followedUser.bio}</p>
                            )}
                          </div>
                        </div>

                        {!isSelf && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFollowToggle(followedUser)}
                            disabled={isLoading}
                            className={`ml-2 px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap flex-shrink-0 ${btnConfig.style} ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isLoading ? '...' : btnConfig.label}
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Not following anyone yet
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

export default FollowingModal;


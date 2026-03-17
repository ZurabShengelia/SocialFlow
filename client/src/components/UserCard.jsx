import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { getUserActiveStatus } from '../utils/helpers';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import { useState } from 'react';
import { BlockConfirmModal } from './BlockConfirmModal';
import { useThemeStore } from '../store/themeStore';

export const UserCard = ({ 
  user, 
  onFollow, 
  onMessage, 
  isFollowing, 
  isBlocked = false, 
  onBlock, 
  onUnblock,
  showBlockButton = false, 
  context = 'explore' 
}) => {
  const navigate = useNavigate();
  const { darkMode } = useThemeStore();
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  const handleProfileClick = () => {
    navigate(`/profile/${user._id}`);
  };

  const handleFollowClick = () => {
    if (onFollow) {
      onFollow(user._id);
    }
  };

  const handleMessageClick = () => {
    if (onMessage) {
      onMessage(user._id);
    }
  };

  const handleBlockClick = () => {
    setShowBlockConfirm(true);
  };

  const handleConfirmBlock = async () => {
    if (onBlock) {
      setIsBlockLoading(true);
      try {
        await onBlock(user._id);
      } finally {
        setIsBlockLoading(false);
        setShowBlockConfirm(false);
      }
    }
  };

  const handleUnblockClick = () => {

    setShowBlockConfirm(true);
  };

  const handleConfirmUnblock = async () => {
    if (onUnblock) {
      setIsBlockLoading(true);
      try {
        await onUnblock(user._id);
      } finally {
        setIsBlockLoading(false);
        setShowBlockConfirm(false);
      }
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="card text-center"
      >
        <div className="relative inline-block mx-auto mb-3">
          <img
            src={getAvatarUrl(user.avatar)}
            alt={user.username}
            className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
            onClick={handleProfileClick}
            onError={(e) => {
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          {user.isOnline === true && (
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"
              title="Active Now"
            />
          )}
        </div>

        <h3 
          className="font-semibold text-primary mb-1 cursor-pointer hover:underline transition"
          onClick={handleProfileClick}
        >
          {user.username}
        </h3>
        <p className="text-sm text-text-tertiary mb-1 line-clamp-2">{user.bio}</p>
        <p className={`text-xs font-medium mb-3 ${user.isOnline ? 'text-green-500' : 'text-text-tertiary'}`}>
          {getUserActiveStatus(user)}
        </p>

        <div className="flex gap-2 text-xs text-text-tertiary mb-4">
          <span className="font-medium">{user.followers?.length || 0} followers</span>
          <span className="font-medium">{user.following?.length || 0} following</span>
        </div>

        {isBlocked ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnblockClick}
              disabled={isBlockLoading}
              className="w-full btn-secondary text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiUnlock className="w-4 h-4" />
              {isBlockLoading ? 'Unblocking...' : 'Unblock'}
            </motion.button>
            {showBlockButton && (
              <button
                onClick={handleMessageClick}
                className="w-full btn-secondary text-sm"
              >
                Message
              </button>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFollowClick}
              className={`w-full btn-secondary text-sm ${isFollowing ? 'opacity-50' : ''}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </motion.button>
            <button
              onClick={handleMessageClick}
              className="w-full btn-secondary text-sm"
            >
              Message
            </button>
            {showBlockButton && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBlockClick}
                className="w-full text-sm px-3 py-2 rounded-lg font-medium transition bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 flex items-center justify-center gap-2 border border-red-600/20"
              >
                <FiLock className="w-4 h-4" />
                Block
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {}
      <BlockConfirmModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={isBlocked ? handleConfirmUnblock : handleConfirmBlock}
        username={user.username}
        isBlocking={!isBlocked}
        isLoading={isBlockLoading}
        darkMode={darkMode}
      />
    </>
  );
};


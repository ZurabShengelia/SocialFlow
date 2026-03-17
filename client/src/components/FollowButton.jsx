import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

const deriveFollowState = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return 'none';
  if (currentUser._id?.toString() === targetUser._id?.toString()) return 'self';

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

const FollowButton = ({
  targetUser,
  onStateChange,
  className = '',
  size = 'md',
}) => {
  const { user: currentUser } = useAuthStore();
  const { follow, unfollow } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const followState = deriveFollowState(currentUser, targetUser);

  if (followState === 'self') return null;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const getButtonProps = () => {
    switch (followState) {
      case 'following':
        return {
          label: 'Following',
          style: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600',
        };
      case 'requested':
        return {
          label: 'Requested',
          style:
            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300',
        };
      default:
        return {
          label: 'Follow',
          style:
            'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-md hover:shadow-violet-500/25',
        };
    }
  };

  const handleClick = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      if (followState === 'following') {
        await unfollow(targetUser._id);
        onStateChange?.('none');
      } else if (followState === 'requested') {

        await unfollow(targetUser._id);
        onStateChange?.('none');
      } else {
        const result = await follow(targetUser._id);
        const newState = result.status === 'requested' ? 'requested' : 'following';
        onStateChange?.(newState);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const { label, style } = getButtonProps();

  return (
    <div className="relative">
      <motion.button
        whileHover={!loading ? { scale: 1.04 } : {}}
        whileTap={!loading ? { scale: 0.96 } : {}}
        onClick={handleClick}
        disabled={loading}
        className={`rounded-lg font-semibold transition-all ${sizeClasses[size]} ${style} ${
          loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } ${className}`}
      >
        {loading ? '...' : label}
      </motion.button>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500 text-white text-xs rounded-lg px-3 py-1.5 z-10 shadow-lg"
        >
          {errorMsg}
        </motion.div>
      )}
    </div>
  );
};

export default FollowButton;


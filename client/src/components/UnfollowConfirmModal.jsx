import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

export const UnfollowConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user = null, 
  loading = false 
}) => {
  const { darkMode } = useThemeStore();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.7,
      }
    },
    exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.2 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl border w-full max-w-sm ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 shadow-slate-900/50'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/50 shadow-gray-900/10'
            }`}
          >
            {}
            <div className="p-8">
              {}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex justify-center mb-6"
              >
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={getAvatarUrl(user.avatar)}
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white/50 shadow-lg ring-2 ring-primary/20"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </motion.div>

              {}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className={`text-xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Are you sure you want to unfollow this user?
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={`text-center mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                @{user.username}
              </motion.p>
            </div>

            {}
            <div className={`flex gap-3 px-8 py-6 rounded-b-2xl border-t ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-gray-100/50 border-gray-200/50'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                onClick={onClose}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ease-in-out shadow-md ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'
                }`}
              >
                No
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ease-in-out shadow-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/30 disabled:opacity-50 ${
                  loading ? 'cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Unfollowing...' : 'Yes'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnfollowConfirmModal;


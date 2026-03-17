import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export const BlockConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  username,
  isBlocking = true,
  isLoading = false,
  darkMode = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-40"
          />

          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.7 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl shadow-2xl border ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 shadow-slate-900/50'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/50 shadow-gray-900/10'
            }`}
          >
            <div className="p-6">
              {}
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`p-2 rounded-full ${isBlocking ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                  >
                    <FiAlertTriangle className={`w-6 h-6 ${isBlocking ? 'text-red-600' : 'text-blue-600'}`} />
                  </motion.div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isBlocking ? 'Block User?' : 'Unblock User?'}
                  </h2>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>

              {}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className={`mb-6 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {isBlocking ? (
                  <div>
                    <span className="font-semibold text-red-600 dark:text-red-400">{username}</span>
                    {' '}will not be able to:
                    <ul className="mt-3 space-y-2 ml-4">
                      {['See your posts or profile', 'Send you messages', 'Find you in search results'].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
                          className="flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{username}</span>
                    {' '}will be able to see your posts and send you messages again.
                  </div>
                )}
              </motion.div>

              {}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-md ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } disabled:opacity-50`}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all duration-300 shadow-lg ${
                    isBlocking
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/30'
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing...
                    </span>
                  ) : isBlocking ? (
                    'Block User'
                  ) : (
                    'Unblock User'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


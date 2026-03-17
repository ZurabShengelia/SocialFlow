import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLock } from 'react-icons/fi';
import { useState } from 'react';
import { BlockConfirmModal } from './BlockConfirmModal';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

export const BlockedUsersModal = ({
  isOpen,
  onClose,
  blockedUsers = [],
  onUnblock,
  isLoading = false,
  darkMode = false,
}) => {
  const [unblockingId, setUnblockingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUnblockClick = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const handleConfirmUnblock = async () => {
    if (selectedUser && onUnblock) {
      setUnblockingId(selectedUser._id);
      try {
        await onUnblock(selectedUser._id);
      } finally {
        setUnblockingId(null);
        setShowConfirm(false);
        setSelectedUser(null);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              {}
              <div className={`flex items-center justify-between p-6 border-b ${
                darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-red-100 dark:bg-red-900/30`}>
                    <FiLock className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Blocked Users ({blockedUsers.length})
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {}
              <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-900/20' : 'bg-gray-50'}`}>
                {blockedUsers.length > 0 ? (
                  <div className="divide-y" style={{ divideColor: darkMode ? '#475569' : '#e5e7eb' }}>
                    {blockedUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition ${
                          darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={getAvatarUrl(user.avatar)}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = DEFAULT_AVATAR;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user.username}
                            </p>
                            <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {user.bio || 'No bio'}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUnblockClick(user)}
                          disabled={isLoading || unblockingId === user._id}
                          className="ml-4 px-4 py-2 rounded-lg font-medium text-sm transition bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 flex-shrink-0"
                        >
                          {unblockingId === user._id ? (
                            <span className="flex items-center gap-1.5">
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Unblocking...
                            </span>
                          ) : (
                            'Unblock'
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FiLock className={`w-12 h-12 mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      You haven't blocked any users
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Blocked users won't be able to see your posts or message you
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {}
      {selectedUser && (
        <BlockConfirmModal
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirmUnblock}
          username={selectedUser.username}
          isBlocking={false}
          isLoading={unblockingId === selectedUser._id}
          darkMode={darkMode}
        />
      )}
    </>
  );
};


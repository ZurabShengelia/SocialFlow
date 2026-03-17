import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiUsers } from 'react-icons/fi';
import { userAPI } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

export const FollowRequestsPanel = () => {
  const { user: currentUser, getMe } = useAuthStore();
  const { darkMode } = useThemeStore();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  const isPrivate = currentUser?.isPrivate;

  useEffect(() => {
    if (isPrivate) {
      fetchRequests();
    }
  }, [isPrivate]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userAPI.getFollowRequests();
      setRequests(data.data || []);
    } catch (err) {
      setError('Failed to load follow requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requesterId) => {
    setActionLoading((prev) => ({ ...prev, [requesterId]: 'accept' }));
    try {
      await userAPI.acceptFollowRequest(requesterId);
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));

      await getMe();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requesterId]: null }));
    }
  };

  const handleReject = async (requesterId) => {
    setActionLoading((prev) => ({ ...prev, [requesterId]: 'reject' }));
    try {
      await userAPI.rejectFollowRequest(requesterId);
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requesterId]: null }));
    }
  };

  if (!isPrivate || requests.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 mb-6 ${
        darkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {}
      <div className="flex items-center gap-2 mb-4">
        <FiUsers className="text-primary w-5 h-5" />
        <h3 className="font-bold text-text-primary">
          Follow Requests
          <span className="ml-2 text-xs font-semibold bg-primary text-white rounded-full px-2 py-0.5">
            {requests.length}
          </span>
        </h3>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {loading ? (
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading…
        </p>
      ) : (
        <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
          <AnimatePresence>
            {requests.map((requester) => {
              const busy = actionLoading[requester._id];
              return (
                <motion.div
                  key={requester._id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(requester.avatar)}
                      alt={requester.username}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div>
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {requester.username}
                      </p>
                      {requester.bio && (
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{requester.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleAccept(requester._id)}
                      disabled={!!busy}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition
                        bg-gradient-to-r from-violet-500 to-cyan-500 text-white
                        ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {busy === 'accept' ? '…' : <><FiCheck size={14} /> Accept</>}
                    </motion.button>

                    {}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleReject(requester._id)}
                      disabled={!!busy}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition
                        ${darkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {busy === 'reject' ? '…' : <><FiX size={14} /> Reject</>}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiX, FiMessageCircle } from 'react-icons/fi';
import { BiSolidHeart } from 'react-icons/bi';
import { useThemeStore } from '../store/themeStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

export const CommentThread = ({ comments, onCommentAdd, onCommentDelete, onCommentLike, currentUserId, postAuthorId }) => {
  const { darkMode } = useThemeStore();
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [likedComments, setLikedComments] = useState(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const toggleLike = (commentId) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
    onCommentLike?.(commentId);
  };

  const handleReply = (commentId) => {
    if (replyText.trim()) {
      onCommentAdd?.(commentId, replyText);
      setReplyText('');
      setExpandedCommentId(null);
    }
  };

  return (
    <motion.div className="space-y-3">
      <AnimatePresence>
        {comments?.map((comment) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`rounded-lg p-3 transition ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <img
                src={getAvatarUrl(comment.author?.avatar)}
                alt={comment.author?.username}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/30"
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
              <div className="flex-1 min-w-0">
                <div className={`rounded-lg px-3 py-2 transition ${
                  darkMode ? 'bg-slate-600' : 'bg-gray-200'
                }`}>
                  <h4 className={`font-medium text-sm ${
                    darkMode ? 'text-white' : 'text-text-primary'
                  }`}>
                    {comment.author?.username}
                  </h4>
                  <p className={`text-sm break-words ${
                    darkMode ? 'text-gray-300' : 'text-text-secondary'
                  }`}>
                    {comment.text}
                  </p>
                </div>
                <div className={`flex items-center gap-4 mt-2 text-xs ${
                  darkMode ? 'text-gray-400' : 'text-text-tertiary'
                }`}>
                  <span>
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleLike(comment._id)}
                    className={`flex items-center gap-1 hover:text-primary transition ${
                      likedComments.has(comment._id) ? 'text-danger' : ''
                    }`}
                  >
                    {likedComments.has(comment._id) ? (
                      <BiSolidHeart size={14} />
                    ) : (
                      <FiHeart size={14} />
                    )}
                  </motion.button>
                  <button
                    onClick={() => setExpandedCommentId(comment._id)}
                    className="flex items-center gap-1 hover:text-primary transition"
                  >
                    <FiMessageCircle size={14} />
                    Reply
                  </button>
                </div>

                {}
                {expandedCommentId === comment._id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 p-3 rounded-lg ${
                      darkMode ? 'bg-slate-800' : 'bg-white'
                    } border ${
                      darkMode ? 'border-slate-700' : 'border-gray-200'
                    }`}
                  >
                    <textarea
                      id="comment_reply_text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className={`w-full p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                        darkMode
                          ? 'bg-slate-700 text-white placeholder-gray-400'
                          : 'bg-gray-100 text-text-primary'
                      }`}
                      rows="2"
                    />
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReply(comment._id)}
                        className="flex-1 px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90"
                      >
                        Reply
                      </motion.button>
                      <button
                        onClick={() => {
                          setExpandedCommentId(null);
                          setReplyText('');
                        }}
                        className={`flex-1 px-3 py-1 rounded text-sm font-medium ${
                          darkMode
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              {(comment.author?._id === currentUserId || postAuthorId === currentUserId) && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirmId(comment._id)}
                  className={`${
                    darkMode ? 'text-gray-500 hover:text-danger' : 'text-text-tertiary hover:text-danger'
                  }`}
                >
                  <FiX size={16} />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-lg p-6 max-w-sm mx-4 shadow-2xl ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-text-primary'
              }`}>
                Are you sure you want to delete this Comment?
              </h3>
              <p className={`text-sm mb-6 ${
                darkMode ? 'text-gray-400' : 'text-text-secondary'
              }`}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirmId(null)}
                  className={`flex-1 px-4 py-2 rounded font-medium transition ${
                    darkMode
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                  }`}
                >
                  No
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onCommentDelete(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-danger text-white rounded font-medium hover:bg-danger/90 transition"
                >
                  Yes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


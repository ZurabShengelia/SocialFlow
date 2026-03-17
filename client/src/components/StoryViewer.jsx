import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStoryStore } from '../store/storyStore';
import { useAuthStore } from '../store/authStore';
import { storyAPI } from '../services/apiService';
import { getAvatarUrl } from '../utils/avatarHelper';

const REACTIONS = ['❤️', '😂', '🔥'];

const getMediaBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:5000';
};

const getMediaUrl = (path) => {
  if (!path) return '';
  let normalizedPath = path.replace(/\\/g, '/');
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    return normalizedPath;
  }
  const baseUrl = getMediaBaseUrl();
  if (normalizedPath.startsWith('/')) {
    return `${baseUrl}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
  }
  return `${baseUrl}/${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
};

const isVideoUrl = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.endsWith('.mov');
};

const isSameUser = (userId1, userId2) => {
  if (!userId1 || !userId2) return false;
  const id1 = typeof userId1 === 'string' ? userId1 : userId1._id || userId1.toString?.();
  const id2 = typeof userId2 === 'string' ? userId2 : userId2._id || userId2.toString?.();
  return id1?.toString?.() === id2?.toString?.();
};

const getTimeAgo = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const StoryViewer = ({ userStories, initialUserIndex = 0, initialStoryIndex = 0, onClose }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(5);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const videoRef = useRef(null);

  const { viewStory, reactToStory, removeReaction, deleteStory } = useStoryStore();
  const { user } = useAuthStore();

  if (!userStories || userStories.length === 0) return null;

  const currentUserGroup = userStories[currentUserIndex];
  if (!currentUserGroup || !currentUserGroup.stories) return null;

  const currentStory = currentUserGroup.stories[currentStoryIndex];
  if (!currentStory) return null;

  const isVideo = currentStory?.videoUrl && !currentStory?.image;
  const isStoryAuthor = currentStory?.author?._id === user?._id || currentUserGroup?.isOwn;
  const userReaction = currentStory?.reactions?.find(r => isSameUser(r.user, user?._id));
  const storyCount = currentUserGroup.stories.length;

  const uniqueViewers = currentStory?.views?.filter(
    (view, index, self) =>
      view.viewer && self.findIndex(v => v.viewer?._id === view.viewer?._id) === index
  ) || [];

  useEffect(() => {
    if (currentStory?._id) {
      viewStory(currentStory._id).catch(console.error);
    }
  }, [currentUserIndex, currentStoryIndex, currentStory?._id, viewStory]);

  useEffect(() => {
    if (!isVideo) {
      setVideoDuration(5);
    } else if (videoRef.current && videoRef.current.duration) {
      setVideoDuration(Math.min(videoRef.current.duration, 60));
    }
  }, [currentUserIndex, currentStoryIndex, isVideo]);

  useEffect(() => {
    setProgress(0);

    if (isVideo && videoRef.current) {
      const handleTimeUpdate = () => {
        const videoDur = Math.min(videoRef.current.duration, 60);
        const percent = (videoRef.current.currentTime / videoDur) * 100;
        setProgress(Math.min(percent, 100));
        if (videoRef.current.currentTime >= videoDur) handleNext();
      };
      const video = videoRef.current;
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.play().catch(() => {});
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.pause();
      };
    } else {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = (elapsed / (videoDuration * 1000)) * 100;
        if (percent >= 100) {
          clearInterval(interval);
          handleNext();
        } else {
          setProgress(percent);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentUserIndex, currentStoryIndex, isVideo, videoDuration]);

  const resetUI = () => {
    setShowReplyInput(false);
    setShowReactions(false);
    setShowViewers(false);
  };

  const handleNext = () => {
    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      resetUI();
    } else if (currentUserIndex < userStories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      resetUI();
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      resetUI();
    } else if (currentUserIndex > 0) {
      const prevUserGroup = userStories[currentUserIndex - 1];
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(prevUserGroup.stories.length - 1);
      resetUI();
    }
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    const end = e.changedTouches[0].clientX;
    setTouchEnd(end);
    const distance = touchStart - end;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrevious();
  };

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart(e.clientX); };
  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const distance = dragStart - e.clientX;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrevious();
  };

  const handleReaction = async (emoji) => {
    try {
      if (userReaction && userReaction.emoji === emoji) {
        await removeReaction(currentStory._id);
      } else {
        await reactToStory(currentStory._id, emoji);
      }
      setShowReactions(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const storyMediaUrl = currentStory.videoUrl || currentStory.image || null;
      await storyAPI.replyToStory(currentStory._id, replyText, { storyMediaUrl });
      setReplyText('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteStory = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteStory(currentStory._id);
      if (currentUserGroup.stories.length <= 1) {
        if (userStories.length <= 1) {
          onClose();
        } else if (currentUserIndex >= userStories.length - 1) {
          setCurrentUserIndex(currentUserIndex - 1);
          setCurrentStoryIndex(0);
        } else {
          setCurrentUserIndex(currentUserIndex + 1);
          setCurrentStoryIndex(0);
        }
      } else if (currentStoryIndex >= currentUserGroup.stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClose}
    >
      <motion.div
        key={`${currentUserIndex}-${currentStoryIndex}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm overflow-hidden bg-black flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ aspectRatio: '9 / 16', borderRadius: '12px' }}
      >
        {}
        <div className="absolute top-0 left-0 right-0 flex gap-1 z-30 p-2 bg-gradient-to-b from-black/40 to-transparent">
          {currentUserGroup.stories.map((story, index) => (
            <motion.div
              key={`story-${story._id}-${index}`}
              className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {index === currentStoryIndex && (
                <motion.div
                  className="h-full bg-white"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.03, ease: 'linear' }}
                />
              )}
              {index < currentStoryIndex && <div className="w-full h-full bg-white" />}
            </motion.div>
          ))}
        </div>

        {}
        <div className="flex-1 relative overflow-hidden bg-black">
          {isVideo && currentStory?.videoUrl && (
            <video
              ref={videoRef}
              src={getMediaUrl(currentStory.videoUrl)}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => console.error('Video failed to load:', getMediaUrl(currentStory.videoUrl), e)}
            />
          )}

          {currentStory?.image && !isVideo && (
            <img
              src={getMediaUrl(currentStory.image)}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {!currentStory?.image && !isVideo && currentStory?.text && (
            <div
              className="w-full h-full"
              style={{ backgroundColor: currentStory?.backgroundColor || '#7c3aed' }}
            />
          )}

          {currentStory?.text && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p
                className="text-white text-center text-3xl font-bold px-6 drop-shadow-2xl"
                style={{ color: currentStory?.backgroundColor === '#ffffff' ? '#000' : '#fff' }}
              >
                {currentStory.text}
              </p>
            </div>
          )}
        </div>

        {}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <img
              src={getAvatarUrl(currentUserGroup.user?.avatar)}
              alt={currentUserGroup.user?.username}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
            <div>
              <p className="text-white font-semibold text-sm">{currentUserGroup.user?.username}</p>
              <p className="text-white/70 text-xs">{getTimeAgo(currentStory?.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStoryAuthor && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteStory}
                disabled={deleteLoading}
                className="text-red-400 hover:text-red-300 text-xl transition disabled:opacity-50"
                title="Delete story"
              >
                🗑️
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition"
            >
              ✕
            </motion.button>
          </div>
        </div>

        {}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 space-y-3 z-20">
          {}
          {currentStory?.reactions && currentStory.reactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-1 flex-wrap"
            >
              {[...new Set(currentStory.reactions.map(r => r.emoji))].map((emoji) => {
                const reactionsWithEmoji = currentStory.reactions.filter(r => r.emoji === emoji);
                const count = reactionsWithEmoji.length;
                const isUserReaction = reactionsWithEmoji.some(r => isSameUser(r.user, user?._id));
                return (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => !isStoryAuthor && handleReaction(emoji)}
                    disabled={isStoryAuthor}
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition ${
                      isUserReaction ? 'bg-primary/40 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                    } ${isStoryAuthor ? 'cursor-default opacity-70' : ''}`}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {}
          {isStoryAuthor ? (
            <div className="flex gap-2 text-xs text-white/70">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowViewers(!showViewers)}
                className="hover:text-white transition cursor-pointer"
              >
                <span>👥 {uniqueViewers.length} views</span>
              </motion.button>
              <span>•</span>
              <span>😊 {currentStory?.reactions?.length || 0} reactions</span>
            </div>
          ) : (

            <div className="flex gap-2">
              <div className="relative flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowReactions(!showReactions)}
                  className={`w-full px-3 py-2 rounded-lg font-medium transition text-sm ${
                    userReaction ? 'bg-primary/40 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {userReaction ? userReaction.emoji : '😊'} React
                </motion.button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-white/90 backdrop-blur rounded-lg p-2 flex gap-1"
                    >
                      {REACTIONS.map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.2 }}
                          onClick={() => handleReaction(emoji)}
                          className="flex-1 text-xl hover:bg-white/50 p-1 rounded transition"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex-1 px-3 py-2 bg-white/20 text-white hover:bg-white/30 rounded-lg font-medium transition text-sm"
              >
                💬 Reply
              </motion.button>
            </div>
          )}

          {}
          <AnimatePresence>
            {showReplyInput && !isStoryAuthor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-2"
              >
                {}
                {(currentStory?.videoUrl || currentStory?.image) && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1.5">
                    {currentStory.videoUrl ? (
                      <video
                        src={getMediaUrl(currentStory.videoUrl)}
                        className="h-10 w-10 rounded object-cover flex-shrink-0"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={getMediaUrl(currentStory.image)}
                        alt="story"
                        className="h-10 w-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <span className="text-white/70 text-xs">Replying to story</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    id="story_reply_input"
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleReply(); }}
                    placeholder="Reply to this story..."
                    className="flex-1 px-3 py-2 bg-white/20 text-white placeholder:text-white/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReply}
                    disabled={replyLoading || !replyText.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    {replyLoading ? '...' : 'Send'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {}
        <AnimatePresence>
          {showViewers && isStoryAuthor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur flex flex-col z-40"
              onClick={() => setShowViewers(false)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="mt-auto bg-black/80 rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-white font-semibold mb-4">
                  Seen by {uniqueViewers.length}
                </div>
                <div className="space-y-3">
                  {uniqueViewers.map((view, index) => (
                    <div key={`viewer-${view._id || index}-${view.viewer?._id || 'unknown'}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAvatarUrl(view.viewer?.avatar)}
                          alt={view.viewer?.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-white text-sm">{view.viewer?.username}</span>
                      </div>
                      {currentStory?.reactions?.some(r => isSameUser(r.user, view.viewer?._id)) && (
                        <span className="text-lg">
                          {currentStory.reactions.find(r => isSameUser(r.user, view.viewer?._id))?.emoji}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        {currentStoryIndex > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-yellow-300 bg-yellow-500/30 hover:text-yellow-100 hover:bg-yellow-500/50 rounded-full transition z-20"
          >
            ‹
          </motion.button>
        )}

        {currentStoryIndex < storyCount - 1 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-yellow-300 bg-yellow-500/30 hover:text-yellow-100 hover:bg-yellow-500/50 rounded-full transition z-20"
          >
            ›
          </motion.button>
        )}
      </motion.div>

      {}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-700 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center pt-2">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <span className="text-3xl">🗑️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Story?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                  Are you sure you want to delete this story?<br />
                  <span className="text-red-500 font-medium">This action cannot be undone.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition duration-200 flex items-center justify-center shadow-lg shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

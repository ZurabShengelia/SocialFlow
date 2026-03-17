import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FiImage, FiSend, FiAlertCircle, FiSmile, FiX, FiVideo } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import EmojiPicker from './EmojiPicker';

export const PostCreator = ({ onSubmit, loading }) => {
  const { darkMode } = useThemeStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null); 
  const [mediaType, setMediaType] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const videoRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    setText(text + emoji);
    setShowEmojiPicker(false);
  };

  const handleMediaChange = (e, type) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) return;

    if (type === 'image') {
      handleImageChange(file);
    } else if (type === 'video') {
      handleVideoChange(file);
    }
  };

  const handleImageChange = (file) => {

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setMedia(file);
    setMediaType('image');
    setVideoDuration(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (file) => {

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only MP4, WebM, and MOV videos are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be less than 50MB');
      return;
    }

    setMedia(file);
    setMediaType('video');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() && !media) {
      setError('Please write something or add a photo/video');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      if (media) {
        formData.append('image', media); 
      }

      await onSubmit(formData);
      setText('');
      setMedia(null);
      setMediaType(null);
      setPreview(null);
      setVideoDuration(0);
      setUploadProgress(0);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType(null);
    setPreview(null);
    setVideoDuration(0);
    setError('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 mb-6 transition-colors ${
        darkMode
          ? 'bg-slate-800 shadow-lg'
          : 'bg-white border border-gray-200 shadow-sm'
      }`}
      onSubmit={handleSubmit}
    >
      {}
      <div className="flex gap-4 mb-4">
        <img
          src={getAvatarUrl(user?.avatar)}
          alt={user?.username}
          className="w-12 h-12 rounded-full flex-shrink-0 object-cover ring-2 ring-primary/30"
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR;
          }}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className={`flex-1 resize-none rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-20 text-sm ${
            darkMode
              ? 'bg-slate-700 text-white placeholder-gray-400 border border-slate-600'
              : 'bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200'
          }`}
        />
      </div>

      {}
      {preview && mediaType === 'image' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative mb-4 rounded-xl overflow-hidden group ${
            darkMode ? 'ring-1 ring-slate-600' : 'ring-1 ring-gray-200'
          }`}
        >
          <img src={preview} alt="Preview" className="w-full max-h-96 object-cover" />

          {}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <span className="text-white text-sm font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={removeMedia}
            className={`absolute top-3 right-3 p-2 rounded-lg transition ${
              darkMode
                ? 'bg-slate-900/80 hover:bg-slate-900 text-white'
                : 'bg-white/80 hover:bg-white text-gray-900'
            }`}
          >
            <FiX size={18} />
          </motion.button>
        </motion.div>
      )}

      {}
      {preview && mediaType === 'video' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative mb-4 rounded-xl overflow-hidden group ${
            darkMode ? 'ring-1 ring-slate-600' : 'ring-1 ring-gray-200'
          }`}
        >
          <video
            ref={videoRef}
            src={preview}
            className="w-full max-h-96 object-cover bg-black"
            onLoadedMetadata={(e) => {
              setVideoDuration(Math.ceil(e.target.duration));
            }}
          />

          {}
          <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md ${
            darkMode
              ? 'bg-black/60 text-white'
              : 'bg-white/80 text-gray-900'
          }`}>
            <FiVideo size={13} />
            {videoDuration}s
          </div>

          {}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <span className="text-white text-sm font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={removeMedia}
            className={`absolute top-3 right-3 p-2 rounded-lg transition ${
              darkMode
                ? 'bg-slate-900/80 hover:bg-slate-900 text-white'
                : 'bg-white/80 hover:bg-white text-gray-900'
            }`}
          >
            <FiX size={18} />
          </motion.button>
        </motion.div>
      )}

      {}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 mb-4 p-3 rounded-lg text-sm ${
            darkMode
              ? 'bg-red-900/30 text-red-300'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <FiAlertCircle size={16} />
          {error}
        </motion.div>
      )}

      {}
      <div className={`flex items-center justify-between pt-3 border-t ${
        darkMode ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <label className={`flex items-center gap-2 cursor-pointer font-medium transition ${
            darkMode
              ? 'text-gray-400 hover:text-violet-400'
              : 'text-gray-600 hover:text-violet-600'
          }`}>
            <FiImage size={18} />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleMediaChange(e, 'image')}
              disabled={loading}
              className="hidden"
            />
          </label>

          <label className={`flex items-center gap-2 cursor-pointer font-medium transition ${
            darkMode
              ? 'text-gray-400 hover:text-violet-400'
              : 'text-gray-600 hover:text-violet-600'
          }`}>
            <FiVideo size={18} />
            <span>Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleMediaChange(e, 'video')}
              disabled={loading}
              className="hidden"
            />
          </label>

          {}
          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className={`flex items-center gap-2 cursor-pointer font-medium transition ${
                darkMode
                  ? 'text-gray-400 hover:text-violet-400'
                  : 'text-gray-600 hover:text-violet-600'
              }`}
            >
              <FiSmile size={18} />
              <span>Emoji</span>
            </motion.button>

            {}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 z-50"
                >
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          disabled={loading || (!text.trim() && !media)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            loading || (!text.trim() && !media)
              ? 'opacity-50 cursor-not-allowed'
              : darkMode
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:shadow-lg'
                : 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-lg'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <FiSend size={18} />
              <span>Post</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};




import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiSmile, FiMic, FiImage, FiX, FiTrash2 } from 'react-icons/fi';
import { VoiceRecorder } from '../services/voiceRecorder';

const EMOJI_CATEGORIES = {
  smileys: ['😀', '�', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😲', '😜', '😎', '🤓', '😐', '😕', '😠', '😡', '🤬', '😢', '😭', '😱', '😰', '🥵', '🥶', '😤', '😖', '🤐', '🤑'],
  hands: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '💅', '🤲', '🙏', '💪', '🦾'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '💯', '💢', '💥', '✨', '🌟', '⭐', '🌠', '💫'],
  objects: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍪', '🍩', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧋', '🔥', '💥', '🎆', '🎇', '✨', '⚡', '💫', '🌈'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🥊', '🥋', '🎣', '🎽', '🎿', '⛷️', '🛷', '🛹', '🛼', '🛶', '🏊', '🏄', '🚣', '🏇', '🚴', '🚵', '🎯', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺', '🎷', '🥁', '🎻'],
  nature: ['🌳', '🌲', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌻', '🌷', '🌹', '🥀', '💐', '🌸', '💮', '🏵️', '🌼', '🌞', '🌝', '🌛', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈'],
  food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥑', '🍆', '🍅', '🌶️', '🌽', '🥒', '🥬', '🥦', '🧄', '🧅', '🍔', '🍟', '🍗', '🍖', '🌭', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥘', '🍚', '🍙', '🍧', '🍨', '🍦', '🍰', '🎂', '🧁', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪'],
  travel: ['✈️', '🚀', '🛸', '💺', '🛰️', '🚁', '🛶', '⛵', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '🚧', '⚓', '🌊', '⛽', '🚧', '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼', '⛩️', '🏰', '🏯', '🏟️', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺', '🎷', '🥁', '🎻', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀'],
};

export const MessageInput = ({
  value = '',
  onChange,
  uploadedFile,
  onFileUpload,
  onSend,
  loading = false,
  darkMode = false,
  onTyping,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');

  const voiceRecorderRef = useRef(new VoiceRecorder());
  const fileInputRef = useRef(null);
  const dragDropRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const handleTextChange = (e) => {
    onChange?.(e.target.value);
    onTyping?.();
  };

  const handleEmojiSelect = (emoji) => {
    const newText = (value || '') + emoji;
    onChange?.(newText);
  };

  const handleStartRecording = async () => {
    const success = await voiceRecorderRef.current.startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      alert('Microphone access denied. Please check permissions.');
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);

    const audioBlob = await voiceRecorderRef.current.stopRecording();
    if (audioBlob) {
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      onFileUpload?.(file);
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
    voiceRecorderRef.current.cancel();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('File too large! Max 100MB allowed.');
        return;
      }
      onFileUpload?.(file);
      e.target.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];

      if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type)) {
        alert('Invalid file type. Accepted: images (JPG, PNG, WebP) and videos (MP4, WebM)');
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert('File too large! Max 100MB allowed.');
        return;
      }

      onFileUpload?.(file);
    }
  };

  const formatRecordingTime = () => {
    const mins = Math.floor(recordingTime / 60);
    const secs = recordingTime % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilePreview = () => {
    if (!uploadedFile) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`mb-2 p-2 rounded-lg flex items-center justify-between ${
          darkMode ? 'bg-slate-700' : 'bg-gray-100'
        }`}
      >
        <span className="text-sm truncate">{uploadedFile.name}</span>
        <button
          type="button"
          onClick={() => onFileUpload?.(null)}
          className="text-danger hover:text-red-700 ml-2"
        >
          <FiTrash2 size={16} />
        </button>
      </motion.div>
    );
  };

  return (
    <div
      ref={dragDropRef}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`p-4 border-t transition ${
        dragActive
          ? darkMode
            ? 'bg-slate-700 border-primary'
            : 'bg-blue-50 border-primary'
          : darkMode
          ? 'border-slate-700'
          : 'border-gray-200'
      }`}
    >
      {}
      <AnimatePresence>{getFilePreview()}</AnimatePresence>

      {}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            ref={emojiPickerRef}
            className={`mb-2 p-3 rounded-lg ${
              darkMode ? 'bg-slate-700' : 'bg-gray-50'
            }`}
          >
            {}
            <div className="flex gap-2 mb-2 pb-2 border-b overflow-x-auto">
              {Object.keys(EMOJI_CATEGORIES).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveEmojiCategory(category)}
                  className={`text-lg px-2 py-1 rounded transition ${
                    activeEmojiCategory === category
                      ? 'bg-primary text-white'
                      : darkMode
                      ? 'hover:bg-slate-600'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {category === 'smileys' && '😀'}
                  {category === 'hands' && '👍'}
                  {category === 'hearts' && '❤️'}
                  {category === 'objects' && '⭐'}
                </button>
              ))}
            </div>

            {}
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_CATEGORIES[activeEmojiCategory].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    handleEmojiSelect(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className={`text-2xl p-2 rounded hover:scale-125 transition ${
                    darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mb-2 p-3 rounded-lg flex items-center justify-between ${
              darkMode ? 'bg-red-900/30 border border-red-500' : 'bg-red-50 border border-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-danger rounded-full animate-pulse" />
              <span className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Recording... {formatRecordingTime()}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStopRecording}
                className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80"
              >
                Stop
              </button>
              <button
                type="button"
                onClick={handleCancelRecording}
                className={`px-3 py-1 rounded text-sm ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex gap-2 items-end">
        {}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-lg transition hover:scale-110 ${
            darkMode
              ? 'hover:bg-slate-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Emoji picker"
        >
          <FiSmile size={20} />
        </button>

        {}
        <button
          type="button"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`p-2 rounded-lg transition hover:scale-110 ${
            isRecording
              ? 'text-danger bg-red-50'
              : darkMode
              ? 'hover:bg-slate-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title={isRecording ? 'Stop recording' : 'Record voice message'}
        >
          <FiMic size={20} />
        </button>

        {}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-lg transition hover:scale-110 ${
            darkMode
              ? 'hover:bg-slate-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Attach image or video"
        >
          <FiImage size={20} />
        </button>

        {}
        <input
          id="message_file_input"
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className="hidden"
        />

        {}
        <input
          id="message_text_input"
          type="text"
          value={value || ''}
          onChange={handleTextChange}
          placeholder="Type a message..."
          disabled={isRecording || loading}
          className={`flex-1 px-4 py-2 rounded-lg outline-none transition ${
            darkMode
              ? 'bg-slate-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary'
              : 'bg-gray-100 text-text-primary placeholder-gray-400 focus:ring-2 focus:ring-primary'
          } disabled:opacity-50`}
        />

        {}
        <button
          type="submit"
          disabled={(!(value && value.trim()) && !uploadedFile) || loading || isRecording}
          onClick={onSend}
          className={`p-2 rounded-lg transition hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode
              ? 'bg-primary hover:bg-primary/80 text-white'
              : 'bg-primary hover:bg-primary/80 text-white'
          }`}
          title="Send message"
        >
          <FiSend size={20} />
        </button>
      </div>

      {}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/20 rounded-lg pointer-events-none flex items-center justify-center"
          >
            <div className="text-center">
              <FiImage size={40} className="mx-auto text-primary mb-2" />
              <p className="text-primary font-semibold">Drop your image or video here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


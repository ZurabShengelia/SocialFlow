import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from './EmojiPicker';
import { useThemeStore } from '../store/themeStore';

const ChatInput = ({ onSendMessage, onTyping, onStopTyping, isLoading = false, darkMode: propDarkMode }) => {
  const { darkMode: storeDarkMode } = useThemeStore();
  const darkMode = propDarkMode !== undefined ? propDarkMode : storeDarkMode;
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.length > 0 && onTyping) {
      onTyping();
    }
  };

  const handleInputBlur = () => {
    if (onStopTyping) {
      onStopTyping();
    }
  };

  const handleSendMessage = (text = message, file = selectedFile) => {
    if ((!text.trim() && !file) || isLoading) return;

    onSendMessage(text, file);
    setMessage('');
    setSelectedFile(null);
    if (onStopTyping) {
      onStopTyping();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {

      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Only image files allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  return (
    <div className={`p-4 backdrop-blur-sm border-t transition flex flex-col gap-3 ${
      darkMode
        ? 'bg-slate-800/80 border-slate-700/60'
        : 'bg-white/90 border-gray-200/60'
    }`}>
      {}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 relative"
          >
            <div className="rounded-xl overflow-hidden max-w-xs shadow-md">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full max-h-40 object-cover rounded-xl"
              />
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-2 right-2 bg-gradient-to-r from-danger to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full p-2 transition shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div
        className={`flex items-center gap-2.5 p-3.5 rounded-full transition-all backdrop-blur-sm border ${
          darkMode
            ? 'bg-slate-700/60 border-slate-600/40 hover:bg-slate-700/80 focus-within:bg-slate-700/90 focus-within:border-primary/50'
            : 'bg-white/90 border-gray-300/60 hover:bg-white focus-within:bg-white focus-within:border-primary/70 focus-within:shadow-lg focus-within:shadow-primary/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2.5 rounded-full transition ${
            darkMode
              ? 'hover:bg-slate-600/60'
              : 'hover:bg-gray-200/80'
          }`}
          title="Add emoji"
        >
          <span className="text-lg">😊</span>
        </motion.button>

        {}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-2.5 rounded-full transition ${
            darkMode
              ? 'text-gray-300 hover:bg-slate-600/60'
              : 'text-slate-700 hover:bg-gray-200/80'
          }`}
          title="Upload image"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </motion.button>

        <input
          id="chat_file_input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {}
        <input
          id="chat_message_input"
          type="text"
          value={message}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Type a message..."
          className={`flex-1 bg-transparent outline-none text-sm font-medium px-2 py-1 rounded-lg transition ${
            darkMode 
              ? 'text-white placeholder-gray-400' 
              : 'text-slate-900 placeholder-slate-500 bg-white/50 hover:bg-white/80 focus:bg-white'
          }`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />

        {}
        <motion.button
          whileHover={(!message.trim() && !selectedFile) || isLoading ? {} : { scale: 1.1 }}
          whileTap={(!message.trim() && !selectedFile) || isLoading ? {} : { scale: 0.9 }}
          onClick={() => handleSendMessage()}
          disabled={(!message.trim() && !selectedFile) || isLoading}
          className={`p-2.5 rounded-full transition ${
            (!message.trim() && !selectedFile) || isLoading
              ? darkMode
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 active:scale-95'
          }`}
          title="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
          </svg>
        </motion.button>
      </div>

      {}
      {(!message.trim() && !selectedFile) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs px-4 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}
        >
          Press Enter to send • Add media or emojis to enrich your message
        </motion.p>
      )}

      {}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-2 absolute bottom-20 left-4 z-50"
          >
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInput;


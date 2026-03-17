import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { buildMediaUrl } from '../utils/helpers';

const MessageBubble = ({ message, isOwnMessage, currentUserId, senderName, darkMode }) => {
  if (!message) return null;

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (message.status === 'seen' || message.seen) {
      return (
        <motion.svg 
          className="w-3.5 h-3.5 text-cyan-400"
          fill="currentColor" 
          viewBox="0 0 20 20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6 }}
        >
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </motion.svg>
      );
    }

    if (message.status === 'sent' || message.status === 'delivered') {
      return (
        <svg className="w-3.5 h-3.5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return (
      <motion.div
        animate={{ opacity: [0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="w-1.5 h-1.5 bg-blue-200 rounded-full"
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex items-end gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
    >
      {}
      <div className={`max-w-xs ${isOwnMessage ? '' : ''}`}>
        {}
        {!isOwnMessage && senderName && (
          <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 px-1">
            {senderName}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl transition backdrop-blur-sm border ${
            isOwnMessage
              ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-none shadow-lg shadow-primary/20'
              : `${
                  darkMode
                    ? 'bg-slate-700/70 border-slate-600/40 text-white rounded-bl-none shadow-lg shadow-slate-700/20'
                    : 'bg-gray-200/90 border-gray-300/40 text-gray-900 rounded-bl-none shadow-lg shadow-gray-200/40'
                }`
          } ${message.status === 'sending' ? 'opacity-75' : ''}`}
        >
          {}
          {message.storyReply && message.storyReply.storyId && (
            <div className={`relative p-2 rounded-lg mt-1 mb-2 ${isOwnMessage ? 'bg-black/20' : darkMode ? 'bg-black/20' : 'bg-white/50' } border-l-4 ${isOwnMessage ? 'border-white/50' : 'border-primary'}`}>
              <p className="text-xs font-semibold mb-1 opacity-90">
                {isOwnMessage ? "You replied to a story" : `Replied to a story`}
              </p>
              {message.storyReply.storyMediaUrl && (
                (() => {
                  const fullUrl = buildMediaUrl(message.storyReply.storyMediaUrl);
                  const isVideo = message.storyReply.storyMediaUrl.toLowerCase().endsWith('.mp4') || 
                                  message.storyReply.storyMediaUrl.toLowerCase().endsWith('.webm');

                  return isVideo ? (
                    <video
                      src={fullUrl}
                      className="max-h-24 rounded"
                      loop
                      muted
                      autoPlay
                    />
                  ) : (
                    <img
                      src={fullUrl}
                      alt=""
                      className="max-h-24 rounded"
                    />
                  );
                })()
              )}
            </div>
          )}

          {}
          {message.media && message.media.type === 'image' && (
            <img
              src={message.media.url}
              alt="Message attachment"
              className="w-full max-w-xs rounded-lg mb-2 max-h-64 object-cover ring-2 ring-white/30"
              loading="lazy"
            />
          )}

          {}
          {message.text && (
            <p className="break-words text-sm leading-relaxed font-medium">{message.text}</p>
          )}

          {}
          <div className={`flex items-center gap-2 mt-1.5 text-xs ${
            isOwnMessage ? 'text-blue-100/80' : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span className="font-medium">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {getStatusIcon()}
          </div>

          {}
          {message.seenAt && isOwnMessage && (
            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100/70' : 'text-gray-400'}`}>
              seen {formatDistanceToNow(new Date(message.seenAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;


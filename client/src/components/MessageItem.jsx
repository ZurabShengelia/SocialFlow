

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { buildMediaUrl } from '../utils/helpers';

export const MessageItem = ({ message, isOwn, currentUser, darkMode }) => {
  const getMediaDisplay = () => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === 'image') {
      return (
        <img
          src={buildMediaUrl(message.mediaUrl)}
          alt="Message image"
          className="max-w-xs rounded-lg mt-2"
        />
      );
    }

    if (message.mediaType === 'video') {
      return (
        <video
          controls
          className="max-w-xs rounded-lg mt-2"
          src={buildMediaUrl(message.mediaUrl)}
        />
      );
    }

    if (message.mediaType === 'audio') {
      return (
        <audio
          controls
          className="max-w-xs rounded-lg mt-2"
          src={buildMediaUrl(message.mediaUrl)}
        />
      );
    }
  };

  const getSeenStatus = () => {
    if (isOwn) {
      if (message.seen) {
        return (
          <span className="text-xs text-primary ml-1 flex items-center gap-0.5">
            ✔✔
          </span>
        );
      }
      if (message.read) {
        return (
          <span className="text-xs text-gray-400 ml-1">✔</span>
        );
      }
    }
  };

  const getStoryReplyDisplay = () => {
    if (!message.storyReply || !message.storyReply.storyId) return null;

    const { storyMediaUrl } = message.storyReply;
    const fullUrl = buildMediaUrl(storyMediaUrl);
    const isVideo = storyMediaUrl && (storyMediaUrl.toLowerCase().endsWith('.mp4') || storyMediaUrl.toLowerCase().endsWith('.webm'));

    return (
      <div className={`relative p-2 rounded-lg mt-2 mb-1 ${isOwn ? 'bg-blue-400' : 'bg-gray-300'} border-l-4 ${isOwn ? 'border-blue-300' : 'border-gray-400'}`}>
        <p className="text-xs font-semibold mb-1 opacity-80">{isOwn ? "You replied to a story" : `Replied to ${message.receiver?.username}'s story`}</p>
        {isVideo ? (
          <video
            src={fullUrl}
            className="max-h-24 rounded"
            loop
          />
        ) : (
          <img
            src={fullUrl}
            alt="Story reply"
            className="max-h-24 rounded"
          />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs`}>
        {}
        <div
          className={`rounded-2xl px-4 py-2 break-words ${
            isOwn
              ? 'bg-primary text-white rounded-br-none'
              : darkMode
              ? 'bg-slate-700 text-white rounded-bl-none'
              : 'bg-gray-200 text-text-primary rounded-bl-none'
          }`}
        >
          {getStoryReplyDisplay()}
          {message.text && <p className="text-sm">{message.text}</p>}
          {getMediaDisplay()}
        </div>

        {}
        <div className={`flex items-center gap-1 text-xs mt-1 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
          {getSeenStatus()}
        </div>
      </div>
    </motion.div>
  );
};


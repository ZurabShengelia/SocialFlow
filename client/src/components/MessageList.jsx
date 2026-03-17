import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import { useThemeStore } from '../store/themeStore';
import { getAvatarUrl } from '../utils/avatarHelper';

const getSenderId = (sender) => {
  if (!sender) return null;
  if (typeof sender === 'object' && sender._id) return String(sender._id);
  if (typeof sender === 'string') return String(sender);
  return null;
};

const getSenderInfo = (sender) => {
  if (!sender) return { id: null, avatar: null, username: null };
  if (typeof sender === 'object') {
    return {
      id: sender._id,
      avatar: sender.avatar,
      username: sender.username || sender.name,
    };
  }
  return { id: sender, avatar: null, username: null };
};

const MessageList = ({ messages, currentUserId, isLoadingMore = false, darkMode: propDarkMode }) => {
  const { darkMode: storeDarkMode } = useThemeStore();
  const darkMode = propDarkMode !== undefined ? propDarkMode : storeDarkMode;
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);

  React.useEffect(() => {
    console.log('🔵 MessageList: messages received:', messages?.length || 0, messages);
    console.log('🔵 MessageList: typeof messages:', typeof messages);
    console.log('🔵 MessageList: Array.isArray(messages):', Array.isArray(messages));
    console.log('🔵 MessageList: !messages:', !messages);
    console.log('🔵 MessageList: messages.length:', messages?.length);
  }, [messages]);

  const groupedMessages = React.useMemo(() => {
    console.log('🟣 GroupedMessages MEMO: messages input:', messages?.length, 'currentUserId:', currentUserId);

    if (!messages || messages.length === 0) {
      console.log('🟣 GroupedMessages: Early return - messages empty');
      return [];
    }

    const groups = [];
    let currentGroup = null;
    const currentUserIdStr = String(currentUserId);

    for (const message of messages) {
      if (!message || !message.sender) continue;

      const senderId = getSenderId(message.sender);
      const senderInfo = getSenderInfo(message.sender);
      const isOwnMessage = senderId === currentUserIdStr;

      const shouldStartNewGroup =
        !currentGroup ||
        currentGroup.isOwnMessage !== isOwnMessage ||
        currentGroup.senderId !== senderId;

      if (shouldStartNewGroup) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          senderId,
          senderInfo,
          isOwnMessage,
          messages: [message],
        };
      } else {
        currentGroup.messages.push(message);
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages, currentUserId]);

  useEffect(() => {
    const scrollToBottom = () => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div ref={messagesContainerRef} className={`w-full h-full flex flex-col ${
      darkMode ? 'bg-gradient-to-b from-slate-800/20 to-slate-900/30' : 'bg-gradient-to-b from-gray-50/50 to-white/30'
    }`}>
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="inline-flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                animate={{ scale: [1, 1.5, 1], y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5">
        {(() => {
          console.log('🟢 RENDER CHECK: !messages =', !messages, ', messages?.length =', messages?.length, ', empty?', !messages || messages.length === 0);
          console.log('🟢 RENDER CHECK: groupedMessages.length =', groupedMessages?.length);

          if (!messages || messages.length === 0) {
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-5xl mb-4 opacity-40"
                >
                  💭
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="font-semibold text-lg mb-2"
                >
                  No messages yet
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-sm opacity-75"
                >
                  Start the conversation with a friendly message!
                </motion.p>
              </motion.div>
            );
          }

          return (
            <div className="space-y-3">
              {groupedMessages.map((group, groupIndex) => (
              <motion.div
                key={`group-${group.senderId}-${groupIndex}`}
                initial={{ opacity: 0, y: 15, x: group.isOwnMessage ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: groupIndex * 0.02 }}
                className={`flex ${
                  group.isOwnMessage ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`flex gap-3 max-w-lg ${group.isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {!group.isOwnMessage && group.senderInfo?.avatar ? (
                    <motion.img
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      src={getAvatarUrl(group.senderInfo.avatar)}
                      alt={group.senderInfo.username || 'User'}
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover ring-2 ring-primary/20 shadow-md hover:ring-primary/50 transition-all"
                      onError={(e) => {
                        e.target.src = getAvatarUrl(null);
                      }}
                    />
                  ) : !group.isOwnMessage ? (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex-shrink-0 shadow-md ring-2 ring-primary/20" 
                    />
                  ) : null}

                  <motion.div
                    className="flex flex-col gap-1"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.03,
                        },
                      },
                    }}
                  >
                    {group.messages.map((message) => (
                      <motion.div
                        key={message._id}
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                      >
                        <MessageBubble
                          message={message}
                          isOwnMessage={group.isOwnMessage}
                          currentUserId={currentUserId}
                          senderName={!group.isOwnMessage ? group.senderInfo?.username : null}
                          darkMode={darkMode}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ))}
            </div>
            );
        })()}

        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default MessageList;


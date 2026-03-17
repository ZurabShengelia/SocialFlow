import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend, FiPaperclip, FiX, FiCheck, FiCheckCircle,
  FiSmile, FiImage, FiMic, FiMoreHorizontal,
} from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';

import { MainLayout } from '../components/MainLayout';
import { ConversationList } from '../components/messages/ConversationList';
import { ConversationHeader } from '../components/messages/ConversationHeader';

import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';

import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import { buildMediaUrl } from '../utils/helpers';

const EMOJIS = {
  '😀': 'smileys', '😂': 'smileys', '🥰': 'smileys', '😍': 'smileys',
  '😎': 'smileys', '🤔': 'smileys', '😭': 'smileys', '😱': 'smileys',
  '🎉': 'smileys', '🔥': 'smileys', '💯': 'smileys', '✨': 'smileys',
  '👍': 'hands', '👎': 'hands', '👏': 'hands', '🙌': 'hands',
  '🤝': 'hands', '🙏': 'hands', '💪': 'hands', '👋': 'hands',
  '❤️': 'hearts', '🧡': 'hearts', '💛': 'hearts', '💚': 'hearts',
  '💙': 'hearts', '💜': 'hearts', '🖤': 'hearts', '💔': 'hearts',
  '😊': 'smileys', '😇': 'smileys', '🥳': 'smileys', '😴': 'smileys',
  '🤣': 'smileys', '😅': 'smileys', '😆': 'smileys', '😁': 'smileys',
  '😋': 'smileys', '😜': 'smileys', '🤪': 'smileys', '😏': 'smileys',
  '🤓': 'smileys', '🧐': 'smileys', '🤩': 'smileys', '🥺': 'smileys',
};

const EMOJI_LIST = Object.keys(EMOJIS);

const isVideoUrl = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.endsWith('.mov');
};

const TypingBubble = ({ avatar, darkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className="flex items-end gap-2"
  >
    <img
      src={getAvatarUrl(avatar)}
      alt=""
      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
      onError={e => { e.target.src = DEFAULT_AVATAR; }}
    />
    <div className={`flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm ${
      darkMode
        ? 'bg-slate-700'
        : 'bg-white shadow-sm border border-slate-100'
    }`}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${darkMode ? 'bg-slate-400' : 'bg-slate-400'}`}
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </motion.div>
);

const MessageBubble = ({ message, isOwn, darkMode, showAvatar, isLast, sender, isNewMessage }) => {
  const hasText = message.text?.trim();
  const hasMedia = message.mediaUrl;
  const [imgExpanded, setImgExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={isNewMessage ? { opacity: 0, y: 12, scale: 0.95 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.2 }}
        className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {}
        <div className="w-8 flex-shrink-0 self-end mb-1">
          {!isOwn && showAvatar && (
            <img
              src={getAvatarUrl(sender?.avatar)}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
              onError={e => { e.target.src = DEFAULT_AVATAR; }}
            />
          )}
        </div>

        <div className={`flex flex-col gap-0.5 max-w-[78%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {}
          {message.storyReply?.storyId && (
            <div className={`px-3 py-2 rounded-xl rounded-bl-sm text-xs max-w-full mb-1 ${
              isOwn
                ? 'bg-indigo-600/30 border-l-2 border-white/50 text-white/80'
                : darkMode
                  ? 'bg-slate-600/50 border-l-2 border-indigo-400 text-slate-300'
                  : 'bg-slate-100 border-l-2 border-indigo-400 text-slate-600'
            }`}>
              <p className="font-semibold mb-0.5 text-[10px] uppercase tracking-wide opacity-70">
                Replied to story
              </p>
              {message.storyReply.storyMediaUrl && (
                isVideoUrl(message.storyReply.storyMediaUrl) ? (
                  <video
                    src={buildMediaUrl(message.storyReply.storyMediaUrl)}
                    className="h-10 rounded object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={buildMediaUrl(message.storyReply.storyMediaUrl)}
                    className="h-10 rounded object-cover"
                    alt="story"
                  />
                )
              )}
            </div>
          )}

          {}
          {hasMedia && (
            <div
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ maxWidth: 320 }}
              onClick={() => message.mediaType !== 'video' && setImgExpanded(true)}
            >
              {message.mediaType === 'video' ? (
                <video
                  src={buildMediaUrl(message.mediaUrl)}
                  controls
                  className="w-full rounded-2xl"
                  style={{ maxHeight: 300 }}
                />
              ) : (
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={buildMediaUrl(message.mediaUrl)}
                  alt="attachment"
                  className="w-full rounded-2xl object-cover"
                  style={{ maxHeight: 300 }}
                />
              )}
            </div>
          )}

          {}
          {hasText && (
            <div className={`
              px-4 py-3 text-[15px] leading-relaxed break-words
              ${isOwn
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/20'
                : darkMode
                  ? 'bg-slate-700 text-slate-100 rounded-2xl rounded-bl-sm'
                  : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100/80'
              }
            `}>
              {message.text}
            </div>
          )}

          {}
          {isLast && (
            <div className={`flex items-center gap-1 px-1 mt-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <span className={`text-[10px] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
              {isOwn && (
                message.seen
                  ? <FiCheckCircle size={12} className="text-indigo-400" />
                  : <FiCheck size={12} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
              )}
            </div>
          )}
        </div>
      </motion.div>

      {}
      <AnimatePresence>
        {imgExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setImgExpanded(false)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={buildMediaUrl(message.mediaUrl)}
              className="max-w-full max-h-full rounded-xl object-contain"
              alt="expanded"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
              onClick={() => setImgExpanded(false)}
            >
              <FiX size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

const ChatInput = ({ onSend, onTyping, sending, darkMode, autoFocusKey }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocusKey) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocusKey]);

  const setFileWithPreview = (f) => {
    setFile(f);
    if (f?.type.startsWith('image/') || f?.type.startsWith('video/')) {
      setPreview({ url: URL.createObjectURL(f), isVideo: f.type.startsWith('video/') });
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = () => {
    if (!text.trim() && !file) return;
    onSend(text.trim(), file);
    setText('');
    clearFile();
    setShowEmoji(false);
  };

  const hasContent = text.trim().length > 0 || !!file;

  return (
    <div className={`flex-shrink-0 px-4 py-4 border-t ${
      darkMode
        ? 'border-slate-700/50 bg-slate-800/80'
        : 'border-slate-100 bg-white/95'
    }`}>
      {}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`mb-3 p-3 rounded-2xl grid grid-cols-8 gap-1 max-h-40 overflow-y-auto ${
              darkMode
                ? 'bg-slate-700/90 border border-slate-600/50'
                : 'bg-white border border-slate-200 shadow-lg'
            }`}
          >
            {EMOJI_LIST.map(emoji => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setText(prev => prev + emoji);
                  setShowEmoji(false);
                  inputRef.current?.focus();
                }}
                className="text-xl p-1 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 relative inline-block"
          >
            {preview.isVideo
              ? <video src={preview.url} className="h-20 rounded-xl object-cover" />
              : <img src={preview.url} className="h-20 rounded-xl object-cover max-w-[120px]" alt="preview" />
            }
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg"
            >
              <FiX size={10} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmoji(v => !v)}
            className={`p-2 rounded-full transition ${
              showEmoji
                ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20'
                : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BsEmojiSmile size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileRef.current?.click()}
            className={`p-2 rounded-full transition ${
              file
                ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20'
                : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FiImage size={20} />
          </motion.button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) setFileWithPreview(f); }}
        />

        {}
        <div className={`flex-1 flex items-center px-4 py-3 rounded-full transition-all ${
          darkMode
            ? 'bg-slate-700/80 focus-within:bg-slate-700'
            : 'bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-200 focus-within:shadow-sm'
        }`}>
          <input
            ref={inputRef}
            id="msg_text_input"
            type="text"
            value={text}
            onChange={e => { setText(e.target.value); onTyping?.(); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Aa"
            className={`flex-1 bg-transparent text-sm outline-none ${
              darkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        {}
        <AnimatePresence mode="wait">
          {hasContent ? (
            <motion.button
              key="send"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={submit}
              disabled={sending}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-colors"
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <FiSend size={16} className="ml-0.5" />
              )}
            </motion.button>
          ) : (
            <motion.button
              key="like"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onSend('👍', null)}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${
                darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
              }`}
            >
              👍
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const EmptyState = ({ darkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl ${
        darkMode ? 'bg-slate-700/60' : 'bg-slate-100'
      }`}
    >
      💬
    </motion.div>
    <div className="text-center">
      <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
        Your messages
      </p>
      <p className={`text-base max-w-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Send private messages to a friend
      </p>
    </div>
  </motion.div>
);

const DateSeparator = ({ date, darkMode }) => (
  <div className="flex items-center gap-3 my-4">
    <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200/80'}`} />
    <span className={`text-[11px] font-medium px-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
      {date}
    </span>
    <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200/80'}`} />
  </div>
);

export const MessagesPage = () => {
  const location = useLocation();
  const { user: me } = useAuthStore();
  const { darkMode } = useThemeStore();
  const { setUnreadMessageCount } = useMessageStore();

  const {
    conversations,
    selectedId,
    selectedConversation,
    unreadCounts,
    totalUnreadCount,
    searchQuery,
    handleSelect,
    handleStartConversation,
    setSearchQuery,
    setSelectedId,
  } = useConversations();

  const {
    messages,
    sending,
    typingList,
    handleSend,
    handleTyping,
  } = useMessages(selectedId, selectedConversation?.otherUser?._id);

  const messagesEndRef = useRef(null);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    setUnreadMessageCount(0);
  }, []);

  useEffect(() => {
    if (location.state?.recipientId) {
      handleStartConversation(location.state.recipientId);
    }
  }, [location.state?.recipientId]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  const filteredConversations = useMemo(() => {
    if (!me?.blockedUsers?.length) return conversations;
    const blockedIds = new Set(me.blockedUsers.map(b => b._id || b));
    return conversations.filter(c => !blockedIds.has(c.otherUser?._id));
  }, [conversations, me?.blockedUsers]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let prevSenderId = null;
    let prevIsOwn = null;
    let prevDate = null;

    messages.forEach((msg, idx) => {
      const senderId = msg.sender?._id ?? msg.sender ?? '';
      const isOwn = senderId === me?._id;
      const msgDate = msg.createdAt
        ? new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
        : null;

      if (msgDate && msgDate !== prevDate) {
        groups.push({ type: 'date', date: msgDate, key: `date-${idx}` });
        prevDate = msgDate;
        prevSenderId = null;
        prevIsOwn = null;
      }

      const lastGroup = [...groups].reverse().find(g => g.type === 'group');
      const sameGroup = lastGroup &&
        prevIsOwn === isOwn &&
        prevSenderId === senderId;

      if (sameGroup) {
        lastGroup.msgs.push(msg);
      } else {
        groups.push({
          type: 'group',
          senderId,
          isOwn,
          sender: msg.sender,
          msgs: [msg],
          key: `g-${senderId}-${idx}`,
        });
      }

      prevSenderId = senderId;
      prevIsOwn = isOwn;
    });

    return groups;
  }, [messages, me?._id]);

  const initialMessageCount = useRef(null);
  useEffect(() => {
    if (initialMessageCount.current === null && messages.length > 0) {
      initialMessageCount.current = messages.length;
    }
  }, [messages.length]);

  const isNewMessage = (idx, totalInGroup, groupStart) => {
    if (initialMessageCount.current === null) return false;
    const absoluteIdx = groupStart + idx;
    return absoluteIdx >= initialMessageCount.current;
  };

  return (
    <MainLayout>
      <div className={`
        fixed top-[64px] left-0 md:left-20 lg:left-64 right-0 bottom-0
        flex overflow-hidden z-10
        ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}
      `}>

        {}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            ${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-[280px] lg:w-[320px] flex-shrink-0 flex-col border-r
            ${darkMode ? 'border-slate-700/50 bg-slate-800/60' : 'border-slate-100 bg-white'}
          `}
        >
          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedId}
            unreadCounts={unreadCounts}
            totalUnreadCount={totalUnreadCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={handleSelect}
            darkMode={darkMode}
          />
        </motion.div>

        {}
        <div className={`flex-1 flex-col min-w-0 ${selectedId ? "flex" : "hidden md:flex"}`}>
          <AnimatePresence mode="wait">
            {selectedConversation ? (
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col h-full"
              >
                <ConversationHeader
                  conversation={selectedConversation}
                  typingList={typingList}
                  darkMode={darkMode}
                  onClose={() => {
                    setSelectedId(null);
                    useMessageStore.setState({ currentMessages: [], currentConversationId: null });
                  }}
                />

                {}
                <div className={`flex-1 overflow-y-auto px-5 py-5 ${
                  darkMode
                    ? 'bg-slate-900/50'
                    : 'bg-gradient-to-b from-slate-50/80 to-white'
                }`}>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full gap-3 py-12"
                    >
                      <img
                        src={getAvatarUrl(selectedConversation.otherUser?.avatar)}
                        alt=""
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-500/20"
                        onError={e => { e.target.src = DEFAULT_AVATAR; }}
                      />
                      <p className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {selectedConversation.otherUser?.username}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Say hello! 👋
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-1">
                      {groupedMessages.map((item, gi) => {
                        if (item.type === 'date') {
                          return <DateSeparator key={item.key} date={item.date} darkMode={darkMode} />;
                        }

                        return (
                          <div key={item.key} className="space-y-1">
                            {item.msgs.map((msg, mi) => {
                              const isLast = mi === item.msgs.length - 1;
                              const showAvatar = isLast;
                              const sender = item.isOwn ? me : selectedConversation.otherUser;
                              return (
                                <MessageBubble
                                  key={msg._id}
                                  message={msg}
                                  isOwn={item.isOwn}
                                  darkMode={darkMode}
                                  showAvatar={showAvatar}
                                  isLast={isLast}
                                  sender={sender}
                                  isNewMessage={false}
                                />
                              );
                            })}
                          </div>
                        );
                      })}

                      {}
                      <AnimatePresence>
                        {typingList.length > 0 && (
                          <TypingBubble
                            key="typing"
                            avatar={selectedConversation.otherUser?.avatar}
                            darkMode={darkMode}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {}
                <ChatInput
                  onSend={handleSend}
                  onTyping={handleTyping}
                  sending={sending}
                  darkMode={darkMode}
                  autoFocusKey={selectedId}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <EmptyState darkMode={darkMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
};


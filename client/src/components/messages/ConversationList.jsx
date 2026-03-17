import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { ConversationItem } from './ConversationItem';

export const ConversationList = ({
  conversations,
  selectedId,
  unreadCounts,
  totalUnreadCount,
  searchQuery,
  onSearchChange,
  onSelect,
  darkMode,
}) => {
  return (
    <div className="flex flex-col h-full">

      {}
      <div className={`px-4 pt-6 pb-3 flex-shrink-0 ${
        darkMode ? 'bg-slate-800/60' : 'bg-white'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className={`text-xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Messages
          </h2>
          <AnimatePresence mode="wait">
            {totalUnreadCount > 0 && (
              <motion.span
                key={totalUnreadCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="min-w-[22px] h-5 px-1.5 bg-indigo-500 text-white
                           text-[11px] font-bold rounded-full flex items-center justify-center"
              >
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {}
        <motion.div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all relative ${
            darkMode
              ? 'bg-slate-700/80 focus-within:bg-slate-700'
              : 'bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-200'
          }`}
          layout
        >
          <FiSearch
            size={14}
            className={darkMode ? 'text-slate-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'}
          />
          <input
            id="conversation_search"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search messages"
            className={`flex-1 bg-transparent text-sm outline-none ${
              darkMode
                ? 'text-slate-200 placeholder-slate-500'
                : 'text-slate-800 placeholder-slate-400'
            }`}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => onSearchChange('')}
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-slate-500 text-slate-200' : 'bg-slate-400 text-white'
                }`}
              >
                <FiX size={10} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {}
      <div className={`h-px mx-4 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`} />

      {}
      <div className={`flex-1 overflow-y-auto px-2 py-2 ${
        darkMode ? 'bg-slate-800/40' : 'bg-white'
      }`}>
        <AnimatePresence>
          {conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                darkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                💬
              </div>
              <p className={`text-sm font-medium ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {searchQuery ? 'No results found' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Start a conversation from a profile
                </p>
              )}
            </motion.div>
          ) : (
            conversations.map((conv, i) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <ConversationItem
                  conversation={conv}
                  isSelected={selectedId === conv._id}
                  unreadCount={unreadCounts[conv._id] ?? 0}
                  onClick={() => onSelect(conv)}
                  darkMode={darkMode}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


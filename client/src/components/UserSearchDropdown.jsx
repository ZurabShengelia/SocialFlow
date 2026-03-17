import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../services/apiService';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

export const UserSearchDropdown = () => {
  const { darkMode } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const isUserBlocked = (userId) => {
    if (!user || !user.blockedUsers) return false;
    return user.blockedUsers.some(
      (blockedUser) => blockedUser._id === userId || blockedUser === userId
    );
  };

  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await userAPI.searchUsers(query);
      let users = response.data?.data || [];

      users = users.filter((u) => !isUserBlocked(u._id));

      setResults(users);
      setIsOpen(users.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleUserClick(results[selectedIndex]._id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {}
      <motion.div
        className={`relative flex items-center transition-all duration-200 ${
          isOpen
            ? darkMode
              ? 'ring-2 ring-violet-500 bg-slate-700 rounded-xl'
              : 'ring-2 ring-violet-500 bg-white rounded-xl'
            : darkMode
            ? 'bg-slate-800 rounded-lg hover:bg-slate-700/80'
            : 'bg-gray-100 rounded-lg hover:bg-gray-200'
        }`}
      >
        <motion.div
          animate={{ rotate: isLoading ? 360 : 0 }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
          className={`ml-3 flex-shrink-0 ${
            darkMode ? 'text-violet-400' : 'text-violet-500'
          }`}
        >
          <FiSearch size={16} />
        </motion.div>

        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          placeholder="Search users..."
          className={`flex-1 px-2.5 py-2 bg-transparent focus:outline-none text-sm placeholder transition ${
            darkMode
              ? 'text-white placeholder-gray-500'
              : 'text-gray-900 placeholder-gray-500'
          }`}
        />

        {}
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearSearch}
              className={`mr-2.5 p-1 rounded-full transition ${
                darkMode
                  ? 'text-gray-400 hover:bg-slate-600 hover:text-gray-200'
                  : 'text-gray-500 hover:bg-gray-300 hover:text-gray-700'
              }`}
              type="button"
            >
              <FiX size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {}
      <AnimatePresence>
        {isOpen && (results.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border backdrop-blur-sm z-50 max-h-96 overflow-y-auto ${
              darkMode
                ? 'bg-slate-800/95 border-slate-700 shadow-slate-900/30'
                : 'bg-white/95 border-gray-200 shadow-gray-900/10'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                  darkMode ? 'border-gray-600 border-t-violet-400' : 'border-gray-300 border-t-violet-500'
                }`} />
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-opacity-50" style={{ 
                borderColor: darkMode ? '#334155' : '#e5e7eb' 
              }}>
                {results.map((user, index) => (
                  <motion.li
                    key={user._id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <motion.button
                      onClick={() => handleUserClick(user._id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition group ${
                        index === selectedIndex
                          ? darkMode
                            ? 'bg-gradient-to-r from-violet-900/40 to-cyan-900/20'
                            : 'bg-gradient-to-r from-violet-50 to-cyan-50'
                          : darkMode
                          ? 'hover:bg-slate-700/50'
                          : 'hover:bg-gray-50'
                      }`}
                      type="button"
                    >
                      {}
                      <motion.img
                        src={getAvatarUrl(user.avatar)}
                        alt={user.username}
                        className={`w-9 h-9 rounded-full object-cover flex-shrink-0 transition ring-2 ${
                          index === selectedIndex
                            ? 'ring-violet-500'
                            : darkMode
                            ? 'ring-slate-700'
                            : 'ring-gray-200'
                        }`}
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        layoutId={`avatar-${user._id}`}
                      />

                      {}
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-semibold text-sm truncate transition ${
                          darkMode ? 'text-white group-hover:text-violet-300' : 'text-gray-900 group-hover:text-violet-600'
                        }`}>
                          {user.username}
                        </p>
                        {user.bio && (
                          <p className={`text-xs truncate ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {user.bio}
                          </p>
                        )}
                      </div>

                      {}
                      <AnimatePresence>
                        {index === selectedIndex && (
                          <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="w-1.5 h-6 rounded-full bg-gradient-to-b from-violet-500 via-cyan-500 to-violet-500"
                            style={{ originX: 0 }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


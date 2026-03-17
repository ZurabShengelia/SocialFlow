import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiUser, FiSettings, FiMenu, FiBell, FiMoon, FiSun, FiTrash2 } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useMessageStore } from '../store/messageStore';
import { useNotificationStore } from '../store/notificationStore';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import { buildMediaUrl } from '../utils/helpers';
import { UserSearchDropdown } from './UserSearchDropdown';

const getNotifText = (n) => {
  const name = n.sender?.username ?? '';
  switch (n.type) {
    case 'follow_request': return `${name} requested to follow you`;
    case 'follow_accept':  return `${name} accepted your follow request`;
    case 'follow':         return `${name} started following you`;
    default: return n.text ?? 'New notification';
  }
};

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { totalUnreadCount, getUnreadMessageCount, setUnreadMessageCount } = useMessageStore();
  const { notifications, unreadCount, getNotifications, markAsRead, deleteNotification,
          getUnreadCount: fetchUnreadCount, markAllAsRead } = useNotificationStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dm = darkMode;

  const notifRef = useRef(null);
  const menuRef  = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (menuRef.current  && !menuRef.current.contains(e.target))  setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (user?._id) { getUnreadMessageCount(); fetchUnreadCount(); getNotifications(); }
  }, [user?._id]);

  useEffect(() => {
    if (location.pathname === '/messages') {
      const t = setTimeout(() => setUnreadMessageCount(0), 0);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  const handleNotifClick = async (n) => {
    if (!n.isRead) await markAsRead(n._id);
    const map = { like_post:'feed', comment_post:'feed', like_comment:'feed',
      follow:`profile/${n.sender?._id}`, follow_request:`profile/${n.sender?._id}`,
      follow_accept:`profile/${n.sender?._id}`, story_like:`profile/${n.sender?._id}`, story_reply:`profile/${n.sender?._id}` };
    if (map[n.type]) navigate(`/${map[n.type]}`);
    setShowNotif(false);
  };

  const navBg    = dm ? 'rgba(13,13,20,0.92)' : 'rgba(255,255,255,0.92)';
  const navBorder= dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const popBg    = dm ? 'rgba(19,19,31,0.98)' : 'rgba(255,255,255,0.98)';
  const popBorder= dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const iconBg   = (active) => active ? (dm ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)') : (dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)');

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 120, damping: 18 }}
      className="sticky top-0 z-50"
      style={{ background: navBg, borderBottom: `1px solid ${navBorder}`, boxShadow: dm ? '0 1px 0 rgba(0,0,0,0.5)' : '0 1px 0 rgba(0,0,0,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">

        {}
        <Link to="/feed" className="flex items-center gap-2 flex-shrink-0 group">
          <motion.img src="/logo.png" alt="SocialFlow"
            whileHover={{ scale: 1.08, rotate: 4 }} whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover"
            style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.6))' }}
          />
          <span className="font-bold text-sm sm:text-base hidden sm:inline" style={{ color: 'var(--text-primary)' }}>SocialFlow</span>
        </Link>

        {}
        <div className="hidden sm:block flex-1 max-w-xs mx-2 sm:mx-4">
          <UserSearchDropdown />
        </div>

        {}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {[['Feed', '/feed'], ['Explore', '/explore']].map(([label, path]) => (
            <Link key={path} to={path} className="relative py-1 hover:text-indigo-500 transition-colors"
              style={{ color: location.pathname === path ? '#6366f1' : undefined }}>
              {label}
              {location.pathname === path && (
                <motion.span layoutId="nav-underline" className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-indigo-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
              )}
            </Link>
          ))}
          <Link to="/messages" className="relative py-1 hover:text-indigo-500 transition-colors flex items-center gap-1">
            Messages
            {totalUnreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                className="absolute -top-2 -right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow"
                style={{ fontSize: '9px' }}>
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </motion.span>
            )}
          </Link>
        </div>

        {}
        <div className="flex items-center gap-1 flex-shrink-0">

          {}
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={toggleDarkMode}
            className="p-2 rounded-xl transition-all" style={{ background: iconBg(false), color: dm ? '#fbbf24' : '#64748b' }}>
            <AnimatePresence mode="wait">
              <motion.div key={dm ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                {dm ? <FiSun size={16} /> : <FiMoon size={16} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {}
          <div className="relative" ref={notifRef}>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setShowNotif(v => !v)}
              className="relative p-2 rounded-xl transition-all"
              style={{ background: iconBg(showNotif), color: showNotif ? '#6366f1' : 'var(--text-secondary)' }}>
              <motion.div animate={unreadCount > 0 ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
                <FiBell size={17} />
              </motion.div>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow"
                    style={{ fontSize: '9px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}

                  className="absolute right-0 mt-2 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: popBg,
                    border: `1px solid ${popBorder}`,
                    boxShadow: dm ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.12)',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    backdropFilter: 'blur(20px)',
                    width: 'min(384px, calc(100vw - 24px))',
                  }}>
                  <div className="sticky top-0 px-4 py-3.5 flex items-center justify-between" style={{ background: popBg, borderBottom: `1px solid ${popBorder}` }}>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition">Mark all read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No notifications yet</div>
                  ) : (
                    notifications.map((n, i) => (
                      <motion.div key={n._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => handleNotifClick(n)} className="group px-4 py-3 flex gap-3 items-start cursor-pointer transition-all"
                        style={{ background: !n.isRead ? (dm ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent', borderBottom: `1px solid ${popBorder}` }}
                        onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = !n.isRead ? (dm ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent'}>
                        <img src={n.sender?.avatar ? buildMediaUrl(n.sender.avatar) : DEFAULT_AVATAR}
                          alt={n.sender?.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          style={{ boxShadow: '0 0 0 2px rgba(99,102,241,0.25)' }}
                          onError={e => { e.target.src = DEFAULT_AVATAR; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2" style={{ color: !n.isRead ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: !n.isRead ? 600 : 500 }}>
                            <span className="font-bold text-indigo-500">{n.sender?.username}</span>{' '}{getNotifText(n).replace(n.sender?.username ?? '', '').trim()}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                        </div>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); deleteNotification(n._id); }}
                          className="flex-shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-red-400 transition"
                          style={{ background: dm ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)' }}>
                          <FiTrash2 size={13} />
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {}
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl" style={{ color: 'var(--text-secondary)', background: iconBg(false) }}>
            <FiMenu size={18} />
          </motion.button>

          {}
          <div className="relative" ref={menuRef}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-1.5 p-1 rounded-xl transition-all"
              style={{ background: showMenu ? (dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent' }}>
              <img src={getAvatarUrl(user?.avatar)} alt={user?.username}
                className="w-8 h-8 rounded-full object-cover"
                style={{ boxShadow: '0 0 0 2px rgba(99,102,241,0.4)' }}
                onError={e => { e.target.src = DEFAULT_AVATAR; }} />
              <span className="hidden sm:inline text-sm font-semibold max-w-[80px] truncate" style={{ color: 'var(--text-primary)' }}>{user?.username}</span>
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl p-1.5 z-50"
                  style={{ background: popBg, border: `1px solid ${popBorder}`, boxShadow: dm ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.12)', backdropFilter: 'blur(20px)' }}>
                  {[[FiUser, 'Profile', `/profile/${user?._id}`], [FiSettings, 'Settings', '/settings']].map(([Icon, label, to], i) => (
                    <motion.div key={to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={to} onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Icon size={15} /> {label}
                      </Link>
                    </motion.div>
                  ))}
                  <div style={{ height: '1px', margin: '4px 8px', background: dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                  <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    onClick={() => { logout(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 transition-all"
                    onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <FiLogOut size={15} /> Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};


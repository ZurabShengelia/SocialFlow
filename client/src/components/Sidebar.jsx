import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCompass, FiMessageSquare, FiBell, FiUser, FiX } from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useMessageStore } from '../store/messageStore';
import { useNotificationStore } from '../store/notificationStore';
import { useEffect } from 'react';

export const Sidebar = ({ open, onClose }) => {
  const { darkMode: dm } = useThemeStore();
  const { totalUnreadCount, getUnreadMessageCount, setUnreadMessageCount } = useMessageStore();
  const { unreadCount: notifUnread } = useNotificationStore();
  const location = useLocation();

  useEffect(() => { getUnreadMessageCount(); }, []);
  useEffect(() => { if (location.pathname === '/messages') setUnreadMessageCount(0); }, [location.pathname]);

  const links = [
    { icon: FiHome,         label:'Home',          path:'/feed' },
    { icon: FiCompass,      label:'Explore',        path:'/explore' },
    { icon: FiMessageSquare,label:'Messages',       path:'/messages', badge:totalUnreadCount },
    { icon: FiBell,         label:'Notifications',  path:'/notifications', badge:notifUnread },
    { icon: GiGamepad,      label:'Games',          path:'/games' },
    { icon: FiUser,         label:'Profile',        path:'/profile' },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path === '/feed' && location.pathname === '/') ||
    (path === '/profile' && location.pathname.startsWith('/profile'));

  const sidebarBg   = dm ? '#111119' : '#ffffff';
  const sidebarBdr  = dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const activeBg    = dm ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)';
  const hoverBg     = dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const activeColor = '#6366f1';
  const inactiveColor = dm ? '#94a3b8' : '#64748b';

  const LinkItem = ({ link, showLabel, onClickExtra }) => {
    const Icon = link.icon;
    const active = isActive(link.path);
    return (
      <Link to={link.path} onClick={onClickExtra}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group"
        style={{
          background: active ? activeBg : 'transparent',
          color: active ? activeColor : inactiveColor,
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        {active && (
          <motion.span layoutId={`indicator-${showLabel}`}
            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-indigo-500"
            transition={{ type:'spring', stiffness:300, damping:25 }} />
        )}
        <motion.div whileHover={{ scale:1.12 }} whileTap={{ scale:0.92 }} transition={{ type:'spring', stiffness:300 }}>
          <Icon size={20} />
        </motion.div>
        {showLabel && <span className="font-semibold text-sm">{link.label}</span>}
        {link.badge > 0 && (
          <motion.span initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:400, damping:14 }}
            className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow"
            style={{ fontSize:'9px' }}>
            {link.badge > 99 ? '99+' : link.badge}
          </motion.span>
        )}
      </Link>
    );
  };

  return (
    <AnimatePresence>
      {}
      {open && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 z-40 md:hidden"
            style={{ backdropFilter:'blur(4px)' }} />
          <motion.aside initial={{ x:-260, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:-260, opacity:0 }}
            transition={{ type:'spring', stiffness:300, damping:30 }}
            className="fixed left-0 top-0 h-full w-64 z-50 md:hidden flex flex-col"
            style={{ background:sidebarBg, borderRight:`1px solid ${sidebarBdr}`, boxShadow:'0 0 60px rgba(0,0,0,0.4)' }}>
            <div className="p-4 flex-1">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl transition"
                style={{ color:inactiveColor }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <FiX size={18} />
              </button>
              <div className="flex items-center gap-3 mb-8 mt-1">
                <img src="/logo.png" alt="SocialFlow" className="w-10 h-10 rounded-xl object-cover"
                  style={{ filter:'drop-shadow(0 0 10px rgba(99,102,241,0.6))' }} />
                <span className="font-bold text-base" style={{ color:'var(--text-primary)' }}>SocialFlow</span>
              </div>
              <div className="space-y-1">
                {links.map((link, i) => (
                  <motion.div key={link.path} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                    <LinkItem link={link} showLabel={true} onClickExtra={onClose} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}

      {}
      <div className="hidden md:flex md:fixed md:left-0 md:top-0 md:flex-col md:w-20 lg:w-64 md:h-screen md:py-4 md:border-r"
        style={{ background:sidebarBg, borderColor:sidebarBdr }}>
        {}
        <div className="flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-5 pt-3 pb-6">
          <motion.img src="/logo.png" alt="SocialFlow"
            whileHover={{ scale:1.08, rotate:4 }} whileTap={{ scale:0.94 }}
            animate={{ y:[0,-3,0] }} transition={{ y:{ duration:3, repeat:Infinity, ease:'easeInOut' }, scale:{ type:'spring', stiffness:300 } }}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            style={{ filter:'drop-shadow(0 0 12px rgba(99,102,241,0.6))' }} />
          <span className="hidden lg:inline font-bold text-base" style={{ color:'var(--text-primary)' }}>SocialFlow</span>
        </div>

        <div className="flex-1 px-2 lg:px-3 space-y-1">
          {links.map((link, i) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <motion.div key={link.path} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}>
                <Link to={link.path}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group"
                  style={{ background: active ? activeBg : 'transparent', color: active ? activeColor : inactiveColor }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  {active && (
                    <motion.span layoutId="desktop-indicator" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-indigo-500"
                      transition={{ type:'spring', stiffness:300, damping:25 }} />
                  )}
                  <motion.div whileHover={{ scale:1.15 }} whileTap={{ scale:0.92 }} transition={{ type:'spring', stiffness:300 }}>
                    <Icon size={20} />
                  </motion.div>
                  <span className="hidden lg:inline font-semibold text-sm">{link.label}</span>
                  {link.badge > 0 && (
                    <motion.span initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:400, damping:14 }}
                      className="lg:ml-auto md:absolute md:right-2 lg:relative w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow"
                      style={{ fontSize:'9px' }}>
                      {link.badge > 99 ? '99+' : link.badge}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AnimatePresence>
  );
};


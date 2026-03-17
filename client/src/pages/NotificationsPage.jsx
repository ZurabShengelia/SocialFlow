import { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiTrash2, FiHeart, FiMessageSquare, FiUserPlus, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';
import { notificationAPI } from '../services/apiService';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';

const getNotificationMessage = (n) => {
  const name = n.sender?.username;
  switch (n.type) {
    case 'like': case 'like_post':     return `liked your post`;
    case 'comment': case 'comment_post': return `commented on your post`;
    case 'like_comment':               return `liked your comment`;
    case 'follow':                     return `started following you`;
    case 'follow_request':             return `sent you a follow request`;
    case 'follow_accept':              return `accepted your follow request`;
    case 'story_like':                 return `liked your story`;
    case 'story_reply':                return `replied to your story`;
    default: return n.text || 'New notification';
  }
};

const getNotifIcon = (type) => {
  if (['like','like_post','like_comment'].includes(type)) return { icon:FiHeart, color:'#f43f5e', bg:'rgba(244,63,94,0.12)' };
  if (['comment','comment_post','story_reply'].includes(type)) return { icon:FiMessageSquare, color:'#6366f1', bg:'rgba(99,102,241,0.12)' };
  if (['follow','follow_request','follow_accept'].includes(type)) return { icon:FiUserPlus, color:'#10b981', bg:'rgba(16,185,129,0.12)' };
  return { icon:FiBell, color:'#f59e0b', bg:'rgba(245,158,11,0.12)' };
};

export const NotificationsPage = () => {
  const { darkMode: dm } = useThemeStore();
  const { notifications, unreadCount, loading, getNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const [page, setPage] = useState(1);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      await getNotifications(1);
      setPage(1);
    } catch (e) { console.error(e); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (e) { console.error(e); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch (e) { console.error(e); }
  };

  const loadMore = async () => {
    try {
      const next = page + 1;
      await getNotifications(next);
      setPage(next);
    } catch (e) { console.error(e); }
  };

  const cardBg = dm ? '#13131f' : '#ffffff';
  const cardBdr = dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25, ease:'easeOut' }}
          className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5" style={{ color:'var(--text-primary)' }}>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(99,102,241,0.12)' }}>
                <FiBell size={18} className="text-indigo-500" />
              </span>
              Notifications
            </h1>
            <p className="text-sm" style={{ color:'var(--text-tertiary)' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button whileHover={{ scale:1.03, boxShadow:'0 4px 20px rgba(99,102,241,0.35)' }} whileTap={{ scale:0.97 }}
              onClick={handleMarkAllAsRead} className="btn-primary flex items-center gap-2 text-sm">
              <FiCheck size={14} /> Mark all read
            </motion.button>
          )}
        </motion.div>

        <div className="space-y-2">
          {loading && notifications.length === 0 ? (
            [...Array(4)].map((_,i) => (
              <div key={i} className="rounded-2xl p-4 flex gap-4 items-center" style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
                <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded-lg w-3/4" />
                  <div className="skeleton h-3 rounded-lg w-1/3" />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-20 rounded-2xl"
              style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background:'rgba(99,102,241,0.1)' }}>
                <FiBell size={28} className="text-indigo-500 opacity-50" />
              </div>
              <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>No notifications yet</p>
              <p className="text-sm" style={{ color:'var(--text-tertiary)' }}>When someone likes your post or follows you, it'll appear here</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {notifications.map((n, i) => {
                const { icon:NIcon, color:niColor, bg:niBg } = getNotifIcon(n.type);
                return (
                  <motion.div key={n._id}
                    initial={{ opacity:0, x:-16, scale:0.98 }}
                    animate={{ opacity:1, x:0, scale:1 }}
                    exit={{ opacity:0, x:20, scale:0.96 }}
                    transition={{ delay:i*0.04, duration:0.25, ease:'easeOut' }}
                    whileHover={{ y:-2, boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)' }}
                    onClick={() => { if (!n.isRead) handleMarkAsRead(n._id); }}
                    className="group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all relative overflow-hidden"
                    style={{
                      background: !n.isRead ? (dm ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : cardBg,
                      border: !n.isRead ? `1px solid rgba(99,102,241,0.2)` : `1px solid ${cardBdr}`,
                    }}
                  >
                    {!n.isRead && (
                      <span className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-indigo-500" />
                    )}

                    <div className="relative flex-shrink-0">
                      <img src={getAvatarUrl(n.sender?.avatar)} alt={n.sender?.username}
                        className="w-11 h-11 rounded-full object-cover"
                        style={{ boxShadow:`0 0 0 2px ${!n.isRead ? 'rgba(99,102,241,0.3)' : cardBdr}` }}
                        onError={e => { e.target.src = DEFAULT_AVATAR; }} />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background:niBg }}>
                        <NIcon size={10} style={{ color:niColor }} />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed" style={{ color:'var(--text-primary)', fontWeight: !n.isRead ? 600 : 500 }}>
                        <span className="font-bold text-indigo-500">{n.sender?.username}</span>{' '}
                        {getNotificationMessage(n)}
                      </p>
                      {n.post?.text && (
                        <p className="text-xs mt-1 line-clamp-1 italic" style={{ color:'var(--text-tertiary)' }}>
                          "{n.post.text}"
                        </p>
                      )}
                      <p className="text-xs mt-1.5" style={{ color:'var(--text-tertiary)' }}>
                        {formatDistanceToNow(new Date(n.createdAt))} ago
                      </p>
                    </div>

                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}

                    <motion.button whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
                      onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
                      className="flex-shrink-0 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 text-red-400 transition"
                      style={{ background: dm ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)' }}>
                      <FiTrash2 size={14} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {notifications.length > 0 && notifications.length % 10 === 0 && (
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={loadMore} className="w-full btn-secondary mt-6">
            Load more
          </motion.button>
        )}
      </div>
    </MainLayout>
  );
};


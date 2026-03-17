import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPhone, FiVideo, FiInfo, FiUser, FiUsers, FiMapPin, FiLink } from 'react-icons/fi';
import { getAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarHelper';
import { OnlineIndicator } from './OnlineIndicator';
import { UserStatus } from './UserStatus';
import { userAPI } from '../../services/apiService';

const Toast = ({ message, onClose }) => (
  <motion.div initial={{ opacity:0, y:-20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10, scale:0.95 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-3 whitespace-nowrap"
    style={{ background:'rgba(15,15,25,0.95)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(20px)' }}>
    <span>🚧</span><span>{message}</span>
    <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition"><FiX size={14} /></button>
  </motion.div>
);

const InfoPanel = ({ user, fullUser, loading, darkMode: dm, onClose, onViewProfile }) => (
  <motion.div initial={{ x:'100%', opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:'100%', opacity:0 }}
    transition={{ type:'spring', stiffness:300, damping:30 }}
    className="absolute top-0 right-0 bottom-0 w-72 z-20 flex flex-col"
    style={{ background: dm ? '#111119' : '#ffffff', borderLeft:`1px solid ${dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`, boxShadow: dm ? '-8px 0 32px rgba(0,0,0,0.5)' : '-8px 0 32px rgba(0,0,0,0.08)' }}>
    <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
      style={{ borderBottom:`1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
      <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Conversation Info</p>
      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={onClose}
        className="p-1.5 rounded-xl transition" style={{ color:'var(--text-tertiary)' }}
        onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <FiX size={15} />
      </motion.button>
    </div>

    <div className="flex flex-col items-center px-4 py-6 gap-3 flex-shrink-0">
      <motion.div whileHover={{ scale:1.05 }} onClick={onViewProfile} className="cursor-pointer relative">
        <img src={getAvatarUrl(user?.avatar)} alt={user?.username}
          className="w-20 h-20 rounded-full object-cover"
          style={{ boxShadow:'0 0 0 3px rgba(99,102,241,0.3), 0 8px 24px rgba(0,0,0,0.2)' }}
          onError={e => { e.target.src = DEFAULT_AVATAR; }} />
        {user?.isOnline && (
          <span className="absolute bottom-1 right-1">
            <OnlineIndicator isOnline={true} size="md" ringColor={dm ? 'dark' : 'light'} pulse={true} />
          </span>
        )}
      </motion.div>
      <div className="text-center">
        <p className="font-bold text-lg" style={{ color:'var(--text-primary)' }}>{user?.username}</p>
        <UserStatus isOnline={user?.isOnline} lastActive={user?.lastActive} className="justify-center mt-0.5" />
      </div>
      <motion.button whileHover={{ scale:1.03, boxShadow:'0 6px 20px rgba(99,102,241,0.4)' }} whileTap={{ scale:0.97 }}
        onClick={onViewProfile} className="w-full mt-1 btn-primary flex items-center gap-2 justify-center">
        <FiUser size={14} /> View Profile
      </motion.button>
    </div>

    <div style={{ height:'1px', margin:'0 16px', background: dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} className="flex-shrink-0" />

    <div className="px-4 py-4 space-y-3 overflow-y-auto">
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-tertiary)' }}>About</p>
      {loading ? (
        <div className="space-y-2">
          {[80,65,50].map((w,i) => <div key={i} className="skeleton h-3.5 rounded-lg" style={{ width:`${w}%` }} />)}
        </div>
      ) : (
        <>
          {(fullUser?.bio || user?.bio) && (
            <div className="flex items-start gap-3 text-sm" style={{ color:'var(--text-secondary)' }}>
              <FiUser size={14} className="mt-0.5 flex-shrink-0 text-indigo-400" />
              <span>{fullUser?.bio || user?.bio}</span>
            </div>
          )}
          {fullUser?.location && (
            <div className="flex items-center gap-3 text-sm" style={{ color:'var(--text-secondary)' }}>
              <FiMapPin size={14} className="flex-shrink-0 text-indigo-400" />
              <span>{fullUser.location}</span>
            </div>
          )}
          {fullUser?.website && (
            <div className="flex items-center gap-3 text-sm" style={{ color:'var(--text-secondary)' }}>
              <FiLink size={14} className="flex-shrink-0 text-indigo-400" />
              <a href={fullUser.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate">{fullUser.website}</a>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm" style={{ color:'var(--text-secondary)' }}>
            <FiUsers size={14} className="flex-shrink-0 text-indigo-400" />
            <span>
              <strong>{(fullUser?.followers || user?.followers)?.length ?? 0}</strong> followers ·{' '}
              <strong>{(fullUser?.following || user?.following)?.length ?? 0}</strong> following
            </span>
          </div>
          {!(fullUser?.bio || user?.bio) && !fullUser?.location && (
            <p className="text-sm" style={{ color:'var(--text-tertiary)' }}>No bio added yet.</p>
          )}
        </>
      )}
    </div>
  </motion.div>
);

export const ConversationHeader = ({ conversation, typingList, onClose, darkMode: dm }) => {
  const navigate = useNavigate();
  const other = conversation?.otherUser;
  const isTyping = typingList?.length > 0;
  const [toast, setToast] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [fullUser, setFullUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (showInfo && other?._id && !fullUser) {
      setLoadingUser(true);
      userAPI.getProfile(other._id).then(r => setFullUser(r.data.data)).catch(() => {}).finally(() => setLoadingUser(false));
    }
    if (!showInfo) setFullUser(null);
  }, [showInfo, other?._id]);

  const goToProfile = () => { if (other?._id) navigate(`/profile/${other._id}`); };
  const showComingSoon = (f) => { setToast(`${f} is coming soon!`); setTimeout(() => setToast(null), 3000); };

  const headerBg  = dm ? 'rgba(17,17,25,0.95)' : 'rgba(255,255,255,0.95)';
  const headerBdr = dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const btnStyle  = { color:'var(--text-tertiary)', borderRadius:'12px', padding:'8px', transition:'all 200ms' };

  return (
    <>
      <AnimatePresence>{toast && <Toast message={toast} onClose={() => setToast(null)} />}</AnimatePresence>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 relative"
        style={{ background:headerBg, borderBottom:`1px solid ${headerBdr}`, backdropFilter:'blur(20px)', boxShadow: dm ? '0 1px 0 rgba(0,0,0,0.3)' : '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 min-w-0 cursor-pointer group" onClick={goToProfile}>
          <div className="relative flex-shrink-0">
            <motion.img whileHover={{ scale:1.06 }}
              src={getAvatarUrl(other?.avatar)} alt={other?.username ?? 'User'}
              className="w-11 h-11 rounded-full object-cover"
              style={{ boxShadow:'0 0 0 2px rgba(99,102,241,0.3)' }}
              onError={e => { e.target.src = DEFAULT_AVATAR; }} />
            {other?.isOnline && (
              <span className="absolute bottom-0 right-0">
                <OnlineIndicator isOnline={true} size="sm" ringColor={dm ? 'dark' : 'header'} pulse={true} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate group-hover:text-indigo-500 transition-colors" style={{ color:'var(--text-primary)' }}>
              {other?.username}
            </p>
            <UserStatus isOnline={other?.isOnline} lastActive={other?.lastActive} isTyping={isTyping} className="mt-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[[FiPhone,'Voice calls'],[FiVideo,'Video calls']].map(([Icon, label]) => (
            <motion.button key={label} whileHover={{ scale:1.1 }} whileTap={{ scale:0.92 }}
              onClick={() => showComingSoon(label)} style={{ ...btnStyle, color:'#6366f1' }}
              onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Icon size={17} />
            </motion.button>
          ))}
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.92 }} onClick={() => setShowInfo(v => !v)}
            style={{ ...btnStyle, color: showInfo ? '#6366f1' : 'var(--text-tertiary)', background: showInfo ? (dm ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)') : 'transparent' }}
            onMouseEnter={e => { if (!showInfo) e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { if (!showInfo) e.currentTarget.style.background = 'transparent'; }}>
            <FiInfo size={17} />
          </motion.button>
          <div style={{ width:'1px', height:'20px', background: dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', margin:'0 4px' }} />
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.92 }} onClick={onClose}
            style={btnStyle}
            onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <FiX size={17} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <InfoPanel user={other} fullUser={fullUser} loading={loadingUser} darkMode={dm}
            onClose={() => setShowInfo(false)}
            onViewProfile={() => { setShowInfo(false); goToProfile(); }} />
        )}
      </AnimatePresence>
    </>
  );
};


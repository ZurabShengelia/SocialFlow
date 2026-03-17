import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiTrash2, FiBookmark } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import { BiSolidHeart } from 'react-icons/bi';
import { formatDistanceToNow } from 'date-fns';
import { useThemeStore } from '../store/themeStore';
import { useCommentStore, usePostStore } from '../store/postStore';
import { HashtagText } from '../utils/hashtagUtils.jsx';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import { buildMediaUrl } from '../utils/helpers';
import { AnimatedCounter } from './AnimatedCounter';

export const PostCard = ({ post, onLike, onUnlike, onDelete, onComment, currentUserId }) => {
  const navigate = useNavigate();
  const { darkMode: dm } = useThemeStore();
  const { getPostComments, createComment, deleteComment, comments } = useCommentStore();
  const { savePost, unsavePost, savedPosts } = usePostStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [commentDeleteConfirmId, setCommentDeleteConfirmId] = useState(null);

  const isSaved = post.isSaved || savedPosts.some(p => (p._id || p) === post._id);
  const isLiked = post.likes?.some(like => String(typeof like === 'string' ? like : like._id) === String(currentUserId)) ?? false;

  const cardBg  = dm ? '#13131f' : '#ffffff';
  const cardBdr = dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const divider = dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const handleSave = async () => {
    setSaveLoading(true);
    try { isSaved ? await unsavePost(post._id) : await savePost(post._id); }
    catch (e) { console.error(e); } finally { setSaveLoading(false); }
  };

  const handleCommentClick = async () => {
    if (!showComments) { setShowComments(true); try { await getPostComments(post._id); } catch (e) {} }
    else { setShowComments(false); }
  };

  const handleHashtagClick = (tag) => navigate(`/explore?hashtag=${encodeURIComponent(tag.replace(/^#/,''))}`);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try { await createComment(post._id, commentText); setCommentText(''); await getPostComments(post._id); }
    catch (e) { console.error(e); } finally { setLoadingComment(false); }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try { await onDelete(post._id); setShowDeleteConfirm(false); }
    catch (e) { console.error(e); } finally { setDeleting(false); }
  };

  const handleConfirmDeleteComment = async (id) => {
    setDeletingCommentId(id);
    try { await deleteComment(id); await getPostComments(post._id); setCommentDeleteConfirmId(null); }
    catch (e) { console.error(e); } finally { setDeletingCommentId(null); }
  };

  const ActionBtn = ({ onClick, active, activeStyle, children, disabled, className = '' }) => (
    <motion.button type="button" whileHover={{ scale:1.02 }} whileTap={{ scale:0.95 }}
      onClick={onClick} disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${className}`}
      style={active ? activeStyle : { color:'var(--text-tertiary)' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </motion.button>
  );

  const ConfirmModal = ({ title, desc, onConfirm, onCancel, confirming }) =>
    createPortal(
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 flex items-center justify-center z-50" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }}
        onClick={onCancel}>
        <motion.div initial={{ scale:0.85, opacity:0, y:-20 }} animate={{ scale:1, opacity:1, y:0 }}
          exit={{ scale:0.85, opacity:0, y:-20 }} transition={{ type:'spring', stiffness:350, damping:28 }}
          onClick={e => e.stopPropagation()}
          className="rounded-2xl p-6 max-w-sm mx-4 w-full" style={{ background:cardBg, border:`1px solid ${cardBdr}`, boxShadow: dm ? '0 24px 80px rgba(0,0,0,0.7)' : '0 24px 80px rgba(0,0,0,0.15)' }}>
          <h3 className="text-base font-bold mb-1" style={{ color:'var(--text-primary)' }}>{title}</h3>
          <p className="text-sm mb-5" style={{ color:'var(--text-secondary)' }}>{desc}</p>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={confirming} className="btn-secondary flex-1">{confirming ? '...' : 'Cancel'}</button>
            <button onClick={onConfirm} disabled={confirming} className="flex-1 px-4 py-2 rounded-xl font-semibold text-sm text-white transition"
              style={{ background:'#f43f5e', boxShadow:'0 4px 12px rgba(244,63,94,0.3)' }}>
              {confirming ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    );

  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.3, ease:'easeOut' }}
      whileHover={{ y:-3, boxShadow: dm ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.10)' }}
      className="mb-4 rounded-2xl overflow-hidden transition-all"
      style={{ background:cardBg, border:`1px solid ${cardBdr}`, boxShadow: dm ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      {}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/profile/${post.author?._id}`)}>
          <motion.img whileHover={{ scale:1.08 }}
            src={getAvatarUrl(post.author?.avatar)} alt={post.author?.username}
            className="w-10 h-10 rounded-full object-cover"
            style={{ boxShadow:'0 0 0 2px rgba(99,102,241,0.3)' }}
            onError={e => { e.target.src = DEFAULT_AVATAR; }} />
          <div>
            <h3 className="text-sm font-bold group-hover:text-indigo-500 transition-colors" style={{ color:'var(--text-primary)' }}>
              {post.author?.username}
            </h3>
            <p className="text-xs" style={{ color:'var(--text-tertiary)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix:true })}
            </p>
          </div>
        </div>
        {post.author?._id === currentUserId && (
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.92 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl transition-all text-red-400"
            style={{ color:'var(--text-tertiary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = dm ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.07)'; e.currentTarget.style.color = '#f43f5e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
            <FiTrash2 size={15} />
          </motion.button>
        )}
      </div>

      {}
      {post.text && (
        <div className="px-5 pb-3">
          <p className="text-sm leading-relaxed" style={{ color:'var(--text-primary)' }}>
            <HashtagText text={post.text} onClick={handleHashtagClick} darkMode={dm} />
          </p>
        </div>
      )}

      {}
      {post.image && (
        <div className="mx-3 mb-3 rounded-xl overflow-hidden" style={{ background: dm ? '#1a1a2e' : '#f1f5f9' }}>
          {(() => {
            const url = buildMediaUrl(post.image);
            const isVid = /\.(mp4|webm|mov)$/i.test(post.image);
            return isVid ? (
              <video controls className="w-full max-h-96 object-cover" onError={e => { e.target.style.display='none'; }}>
                <source src={url} />
              </video>
            ) : (
              <motion.img whileHover={{ scale:1.03 }} transition={{ duration:0.4 }}
                src={url} alt="Post" className="w-full max-h-96 object-cover cursor-zoom-in"
                onError={e => { e.target.style.display='none'; }} />
            );
          })()}
        </div>
      )}

      {}
      <div className="px-5 py-2.5 flex gap-5 text-xs font-semibold" style={{ color:'var(--text-tertiary)', borderTop:`1px solid ${divider}` }}>
        <span><AnimatedCounter from={0} to={post.likes?.length || 0} duration={400} /> likes</span>
        <span><AnimatedCounter from={0} to={post.comments?.length || 0} duration={400} /> comments</span>
        <span><AnimatedCounter from={0} to={post.shares || 0} duration={400} /> shares</span>
      </div>

      {}
      <div className="px-3 py-1.5 flex gap-1" style={{ borderTop:`1px solid ${divider}` }}>
        <ActionBtn
          onClick={async () => { setLikeLoading(true); try { isLiked ? await Promise.resolve(onUnlike(post._id)) : await Promise.resolve(onLike(post._id)); } catch (e) {} finally { setLikeLoading(false); } }}
          active={isLiked} disabled={likeLoading}
          activeStyle={{ color:'#f43f5e', background:'rgba(244,63,94,0.1)' }}>
          <motion.div animate={isLiked ? { scale:[1,1.4,1] } : {}} transition={{ duration:0.3 }}>
            {isLiked ? <BiSolidHeart size={18} /> : <FiHeart size={18} />}
          </motion.div>
          Like
        </ActionBtn>

        <ActionBtn onClick={handleCommentClick} active={showComments}
          activeStyle={{ color:'#6366f1', background:'rgba(99,102,241,0.1)' }}>
          <FiMessageCircle size={18} /> Comment
        </ActionBtn>

        <ActionBtn onClick={() => { if (navigator.share) { navigator.share({ text:post.text||'', url:window.location.href }); } else { navigator.clipboard.writeText(window.location.href); } }}>
          <FiShare2 size={18} /> Share
        </ActionBtn>

        <motion.button type="button" whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
          onClick={handleSave} disabled={saveLoading}
          className="flex items-center justify-center px-3 py-2.5 rounded-xl transition-all"
          style={isSaved ? { color:'#6366f1', background:'rgba(99,102,241,0.1)' } : { color:'var(--text-tertiary)' }}
          onMouseEnter={e => { if (!isSaved) e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
          onMouseLeave={e => { if (!isSaved) e.currentTarget.style.background = 'transparent'; }}>
          <motion.div animate={isSaved ? { rotate:[0,-10,10,0] } : {}} transition={{ duration:0.4 }}>
            {isSaved ? <BsBookmarkFill size={16} /> : <FiBookmark size={16} />}
          </motion.div>
        </motion.button>
      </div>

      {}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            transition={{ duration:0.3, type:'spring', stiffness:200, damping:25 }}
            className="px-5 pt-4 pb-5" style={{ borderTop:`1px solid ${divider}` }}>
            <form onSubmit={e => { e.preventDefault(); handleAddComment(); }} className="flex gap-2 mb-4">
              <input type="text" placeholder="Write a comment…" value={commentText} onChange={e => setCommentText(e.target.value)}
                disabled={loadingComment} className="input-field flex-1 text-sm" />
              <motion.button type="submit" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                disabled={loadingComment || !commentText.trim()} className="btn-primary text-sm px-4">
                {loadingComment ? '…' : 'Post'}
              </motion.button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments && comments.length > 0 ? comments.map((c, i) => (
                <motion.div key={c._id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all"
                  style={{ background: dm ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}>
                  <img src={getAvatarUrl(c.author?.avatar)} alt={c.author?.username}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    onError={e => { e.target.src = DEFAULT_AVATAR; }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold" style={{ color:'var(--text-primary)' }}>{c.author?.username}</span>
                      {(c.author?._id === currentUserId || post.author?._id === currentUserId) && (
                        <button onClick={() => setCommentDeleteConfirmId(c._id)} disabled={deletingCommentId === c._id}
                          className="text-xs text-red-400 hover:text-red-500 transition px-1.5 py-0.5 rounded-lg"
                          onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.07)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <FiTrash2 size={11} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color:'var(--text-secondary)' }}>{c.text}</p>
                    <p className="text-xs mt-1" style={{ color:'var(--text-tertiary)' }}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix:true })}</p>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-center py-4" style={{ color:'var(--text-tertiary)' }}>No comments yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showDeleteConfirm && <ConfirmModal title="Delete this post?" desc="This cannot be undone." onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteConfirm(false)} confirming={deleting} />}
      {commentDeleteConfirmId && <ConfirmModal title="Delete this comment?" desc="This cannot be undone." onConfirm={() => handleConfirmDeleteComment(commentDeleteConfirmId)} onCancel={() => setCommentDeleteConfirmId(null)} confirming={deletingCommentId === commentDeleteConfirmId} />}
    </motion.div>
  );
};


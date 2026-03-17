import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../components/MainLayout';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { usePostStore, useCommentStore } from '../store/postStore';
import { postAPI } from '../services/apiService';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiArrowLeft, FiTrash2, FiSend } from 'react-icons/fi';
import { BiSolidHeart } from 'react-icons/bi';
import { BsBookmarkFill } from 'react-icons/bs';
import { HashtagText } from '../utils/hashtagUtils.jsx';

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useThemeStore();
  const { user } = useAuthStore();
  const { likePost, unlikePost, savePost, unsavePost, savedPosts } = usePostStore();
  const { getPostComments, createComment, deleteComment, comments } = useCommentStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const isLiked = post?.likes?.some(like => {
    const likeId = typeof like === 'string' ? like : like._id;
    return String(likeId) === String(user?._id);
  }) ?? false;

  const isSaved = post?.isSaved || savedPosts.some(p => (p._id || p) === postId);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await postAPI.getPost(postId);
        setPost(data.data);
        await getPostComments(postId);
      } catch (err) {
        setError('Post not found or has been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    setLikeLoading(true);
    try {
      const updated = isLiked ? await unlikePost(post._id) : await likePost(post._id);
      setPost(updated);
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!post) return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await unsavePost(post._id);
        setPost(p => ({ ...p, isSaved: false }));
      } else {
        await savePost(post._id);
        setPost(p => ({ ...p, isSaved: true }));
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      await createComment(postId, commentText);
      setCommentText('');
      await getPostComments(postId);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      await getPostComments(postId);
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const mediaUrl = post?.image ? buildMediaUrl(post.image) : null;
  const isVideo = mediaUrl && /\.(mp4|webm|mov|quicktime)$/i.test(post.image);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg font-medium transition ${
            darkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiArrowLeft />
          Back
        </motion.button>

        {loading && (
          <div className={`card-lg animate-pulse`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700" />
              <div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-2" />
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-20" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-4/5 mb-4" />
            <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl mb-4" />
          </div>
        )}

        {error && (
          <div className="card-lg text-center py-12">
            <p className="text-text-tertiary text-lg">{error}</p>
            <button onClick={() => navigate('/feed')} className="btn-primary mt-4">
              Go to Feed
            </button>
          </div>
        )}

        {!loading && !error && post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-lg mb-4"
          >
            {}
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${post.author?._id}`)}
              >
                <img
                  src={getAvatarUrl(post.author?.avatar)}
                  alt={post.author?.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
                  onError={e => { e.target.src = DEFAULT_AVATAR; }}
                />
                <div>
                  <h3 className={`font-bold text-base hover:text-primary transition ${darkMode ? 'text-white' : 'text-text-primary'}`}>
                    {post.author?.username}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-text-tertiary'}`}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {post.author?._id === user?._id && (
                <button
                  onClick={async () => {
                    if (window.confirm('Delete this post?')) {
                      await usePostStore.getState().deletePost(post._id);
                      navigate(-1);
                    }
                  }}
                  className={`p-2 rounded-lg transition ${darkMode ? 'text-gray-500 hover:text-danger hover:bg-slate-700' : 'text-text-tertiary hover:text-danger hover:bg-red-50'}`}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>

            {}
            {post.text && (
              <p className={`mb-4 text-base leading-relaxed ${darkMode ? 'text-gray-200' : 'text-text-primary'}`}>
                <HashtagText text={post.text} onClick={(tag) => navigate(`/explore?hashtag=${encodeURIComponent(tag)}`)} darkMode={darkMode} />
              </p>
            )}

            {}
            {mediaUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                {isVideo ? (
                  <video controls className="w-full max-h-[500px] object-cover">
                    <source src={mediaUrl} />
                  </video>
                ) : (
                  <img src={mediaUrl} alt="Post" className="w-full object-cover max-h-[500px]" />
                )}
              </div>
            )}

            {}
            <div className={`flex gap-4 text-sm py-3 border-y mb-3 ${darkMode ? 'border-slate-700 text-gray-400' : 'border-gray-200 text-text-tertiary'}`}>
              <span className="font-medium">{post.likes?.length || 0} likes</span>
              <span className="font-medium">{comments?.length || 0} comments</span>
            </div>

            {}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                  isLiked
                    ? `text-danger ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`
                    : `${darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-text-tertiary hover:bg-gray-50'}`
                } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLiked ? <BiSolidHeart /> : <FiHeart />}
                <span>Like</span>
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                  darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                }`}
              >
                <FiMessageCircle />
                <span>Comment</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'SocialFlow Post', text: post.text || '', url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                  darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-text-tertiary hover:bg-gray-50'
                }`}
              >
                <FiShare2 />
                <span>Share</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  isSaved
                    ? `text-primary ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`
                    : `${darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-text-tertiary hover:bg-gray-50'}`
                } ${saveLoading ? 'opacity-50' : ''}`}
              >
                {isSaved ? <BsBookmarkFill size={16} /> : <FiBookmark size={16} />}
              </button>
            </div>

            {}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <img
                src={getAvatarUrl(user?.avatar)}
                alt={user?.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                onError={e => { e.target.src = DEFAULT_AVATAR; }}
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  disabled={loadingComment}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition focus:outline-none focus:ring-2 focus:ring-primary ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={loadingComment || !commentText.trim()}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-1 ${
                    loadingComment || !commentText.trim()
                      ? darkMode ? 'bg-slate-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <FiSend size={14} />
                </button>
              </div>
            </form>

            {}
            <div className="space-y-3">
              <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-text-secondary'}`}>
                {comments?.length || 0} Comments
              </h3>
              {comments && comments.length > 0 ? (
                comments.map(comment => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                  >
                    <img
                      src={getAvatarUrl(comment.author?.avatar)}
                      alt={comment.author?.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${comment.author?._id}`)}
                      onError={e => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold cursor-pointer hover:text-primary transition ${darkMode ? 'text-white' : 'text-slate-900'}`}
                          onClick={() => navigate(`/profile/${comment.author?._id}`)}
                        >
                          {comment.author?.username}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {(comment.author?._id === user?._id || post.author?._id === user?._id) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className={`text-xs p-1 rounded transition ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-400 hover:bg-red-50'}`}
                            >
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {comment.text}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className={`text-sm text-center py-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};


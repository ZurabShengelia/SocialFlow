import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { PostCreator } from '../components/PostCreator';
import { PostCard } from '../components/PostCard';
import { StoriesBar } from '../components/StoriesBar';
import { StoryViewer } from '../components/StoryViewer';
import { usePostStore } from '../store/postStore';
import { useStoryStore } from '../store/storyStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { messageAPI } from '../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRss } from 'react-icons/fi';

export const FeedPage = () => {
  const { feed, loading, createPost, getFeed, likePost, unlikePost, deletePost } = usePostStore();
  const { likeStory, replyToStory, getFollowingStories } = useStoryStore();
  const { user } = useAuthStore();
  const { darkMode: dm } = useThemeStore();
  const navigate = useNavigate();

  const blockedUserIds = useMemo(() => {
    if (!user?.blockedUsers) return new Set();
    return new Set(user.blockedUsers.map(b => b._id || b));
  }, [user?.blockedUsers]);

  const filteredFeed = useMemo(
    () => feed.filter(post => !blockedUserIds.has(post.author?._id || post.userId)),
    [feed, blockedUserIds]
  );

  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedStories, setSelectedStories] = useState(null);
  const [storyStartIndex, setStoryStartIndex] = useState(0);
  const [storiesFromSameAuthor, setStoriesFromSameAuthor] = useState([]);

  useEffect(() => {
    getFeed(1).then(() => setHasLoaded(true)).catch(() => setHasLoaded(true));
    getFollowingStories().catch(() => {});
  }, []);

  const handleCreatePost = async (formData) => {
    try { await createPost(formData); } catch (e) { console.error(e); }
  };

  const handleLike = async (postId) => {
    try { await likePost(postId); } catch (e) { console.error(e); }
  };

  const handleUnlike = async (postId) => {
    try { await unlikePost(postId); } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    try { await deletePost(postId); } catch (e) { console.error(e); }
  };

  const handleStoryClick = (groups, startIdx = 0) => {
    setStoriesFromSameAuthor(groups);
    setSelectedStories(groups);
    setStoryStartIndex(startIdx);
  };

  const handleReplyToStory = async (storyId, replyText) => {
    try {
      if (!replyText.trim()) return;
      await replyToStory(storyId, replyText);
      const story = storiesFromSameAuthor.find(s => s._id === storyId);
      if (story?.author?._id) {
        try {
          const conv = await messageAPI.createConversation(story.author._id);
          await messageAPI.sendMessage(conv.data.data._id, `Replied to your story: "${replyText}"`, null);
        } catch (e) {}
      }
      setSelectedStories(null);
      setStoriesFromSameAuthor([]);
    } catch (e) { console.error(e); }
  };

  return (
    <MainLayout>
      <StoriesBar onAddStoryClick={() => navigate('/stories')} onStoryClick={handleStoryClick} />
      <PostCreator onSubmit={handleCreatePost} loading={loading} />

      {filteredFeed.length === 0 && !loading && hasLoaded ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="text-center py-20 rounded-2xl mt-4"
          style={{ background: dm ? '#13131f' : '#ffffff', border:`1px solid ${dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background:'rgba(99,102,241,0.1)' }}>
            <FiRss size={28} className="text-indigo-500 opacity-60" />
          </div>
          <p className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>Your feed is empty</p>
          <p className="text-sm" style={{ color:'var(--text-tertiary)' }}>Follow people to see their posts here</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="mt-4"
        >
          {filteredFeed.map((post) => (
            <motion.div
              key={post._id}
              variants={{ hidden: { opacity:0, y:12 }, visible: { opacity:1, y:0 } }}
              transition={{ duration:0.25, ease:'easeOut' }}
            >
              <PostCard post={post} onLike={handleLike} onUnlike={handleUnlike}
                onDelete={handleDelete} currentUserId={user?._id} />
            </motion.div>
          ))}
          {loading && (
            <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }}
              className="text-center py-8 text-sm" style={{ color:'var(--text-tertiary)' }}>
              Loading more posts…
            </motion.div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedStories && selectedStories.length > 0 && (
          <StoryViewer userStories={selectedStories} initialUserIndex={storyStartIndex} initialStoryIndex={0}
            onClose={() => { setSelectedStories(null); setStoriesFromSameAuthor([]); setStoryStartIndex(0); }} />
        )}
      </AnimatePresence>
    </MainLayout>
  );
};


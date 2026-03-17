import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { PostCard } from '../components/PostCard';
import { UserCard } from '../components/UserCard';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import { useUserStore } from '../store/userStore';
import { useMessageStore } from '../store/messageStore';
import { useThemeStore } from '../store/themeStore';
import { motion } from 'framer-motion';
import { FiSearch, FiHash, FiTrendingUp } from 'react-icons/fi';
import { postAPI } from '../services/apiService';

export const ExplorePage = () => {
  const navigate = useNavigate();
  const { user, blockUser, unblockUser } = useAuthStore();
  const { darkMode } = useThemeStore();
  const { likePost, unlikePost, deletePost } = usePostStore();
  const { follow, unfollow } = useUserStore();
  const { createConversation } = useMessageStore();
  const [recentPosts, setRecentPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [page, setPage] = useState(1);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [isHashtagMode, setIsHashtagMode] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('hashtag') ? '#' + searchParams.get('hashtag') : ''
  );

  const blockedUserIds = useMemo(() => {
    if (!user?.blockedUsers) return new Set();
    return new Set(user.blockedUsers.map(b => b._id || b));
  }, [user?.blockedUsers]);

  const getFilteredUsers = (users) => users.filter(u => !blockedUserIds.has(u._id));
  const getFilteredPosts = (posts) => posts.filter(p => !blockedUserIds.has(p.author?._id || p.userId));
  const isUserBlocked = (userId) => blockedUserIds.has(userId);

  const isInitialLoadDone = useRef(false);

  useEffect(() => {
    const tag = searchParams.get('hashtag');
    if (tag) setSearchQuery('#' + tag);
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery && searchQuery.startsWith('#')) {
      const tag = searchQuery.replace(/^#+/, '').trim();
      if (tag.length > 0) fetchHashtagPosts(tag);
    } else if (!searchQuery) {
      setIsHashtagMode(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isInitialLoadDone.current) return;
    if (!searchParams.get('hashtag')) {
      isInitialLoadDone.current = true;
      fetchExploreData();
    }
  }, []);

  const fetchHashtagPosts = async (tag) => {
    setLoading(true);
    setIsHashtagMode(true);
    try {
      const { data } = await postAPI.getPostsByHashtag(tag);
      setRecentPosts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch hashtag posts:', error);
      setRecentPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      const { data } = await postAPI.getTrendingHashtags();
      if (data?.data?.length > 0) setTrendingHashtags(data.data);
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error);
    }
  };

  const fetchExploreData = async () => {
    setLoading(true);
    setIsHashtagMode(false);
    try {
      const { data } = await postAPI.getExplore(page);
      setRecentPosts(page === 1 ? data.data.recentPosts : [...recentPosts, ...data.data.recentPosts]);
      if (page === 1) {
        setSuggestedUsers(data.data.suggestedUsers);
        await fetchTrendingHashtags();
      }
    } catch (error) {
      console.error('Failed to fetch explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setIsHashtagMode(false);
    fetchExploreData();
  };

  const handleBlock = async (userId) => {
    try {
      await blockUser(userId);
      setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
      setRecentPosts(prev => prev.filter(p => p.author?._id !== userId));
    } catch (error) {
      alert(`Failed to block user: ${error?.message}`);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      const { data } = await postAPI.getExplore(1);
      setSuggestedUsers(data.data.suggestedUsers || []);
    } catch (error) {
      alert(`Failed to unblock user: ${error?.message}`);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await likePost(postId);
      setRecentPosts(prev => prev.map(p => p._id === postId ? result : p));
    } catch (error) {
      alert(`Failed to like post: ${error?.response?.data?.message || error?.message}`);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const result = await unlikePost(postId);
      setRecentPosts(prev => prev.map(p => p._id === postId ? result : p));
    } catch (error) {
      alert(`Failed to unlike post: ${error?.response?.data?.message || error?.message}`);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await follow(userId);
      setFollowingUsers(new Set([...followingUsers, userId]));
      const { data } = await postAPI.getExplore(1);
      setSuggestedUsers(data.data.suggestedUsers);
    } catch (error) {
      alert(`Failed to follow user: ${error?.message}`);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollow(userId);
      const newFollowing = new Set(followingUsers);
      newFollowing.delete(userId);
      setFollowingUsers(newFollowing);
      const { data } = await postAPI.getExplore(1);
      setSuggestedUsers(data.data.suggestedUsers);
    } catch (error) {
      alert(`Failed to unfollow user: ${error?.message}`);
    }
  };

  const handleMessage = async (userId) => {
    try {
      await createConversation(userId);
      navigate('/messages', { state: { recipientId: userId } });
    } catch (error) {
      alert(`Failed to start message: ${error?.message}`);
    }
  };

  const visiblePosts = getFilteredPosts(recentPosts).filter(p => {
    if (isHashtagMode) return true;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().replace('#', '');
    const text = (p.text || '').toLowerCase();
    const username = (p.author?.username || '').toLowerCase();
    return text.includes(q) || username.includes(q);
  });

  return (

    <MainLayout wide>
      <div className="w-full">
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Explore
          </h1>
          <p className="text-text-tertiary mb-6">Discover trending posts and users to follow</p>
        </motion.div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <span>Showing posts for</span>
                  <span className="font-bold">
                    {searchQuery.startsWith('#') ? searchQuery : '#' + searchQuery}
                  </span>
                  <button
                    onClick={handleClearSearch}
                    className="ml-auto text-xs opacity-60 hover:opacity-100 transition"
                  >
                    Clear ✕
                  </button>
                </motion.div>
              )}

              {visiblePosts.length === 0 && !loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 card-lg"
                >
                  <p className="text-text-tertiary">
                    {isHashtagMode
                      ? `No posts found for ${searchQuery}`
                      : 'No posts to explore yet'}
                  </p>
                </motion.div>
              ) : (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    onDelete={async (postId) => {
                      try {
                        await deletePost(postId);
                        setRecentPosts(prev => prev.filter(p => p._id !== postId));
                        fetchTrendingHashtags();
                      } catch (error) {
                        console.error('Failed to delete post:', error);
                        throw error;
                      }
                    }}
                    currentUserId={user?._id}
                  />
                ))
              )}

              {loading && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-center py-8 text-text-tertiary"
                >
                  Loading...
                </motion.div>
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-lg sticky top-20"
            >
              {}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <FiSearch className="text-text-tertiary flex-shrink-0" size={16} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value) handleClearSearch();
                  }}
                  className="bg-transparent flex-1 outline-none text-sm text-text-primary placeholder-text-tertiary"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="text-text-tertiary hover:text-text-primary transition flex-shrink-0 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {}
              {trendingHashtags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                    <FiTrendingUp className="text-primary" size={16} />
                    Trending
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {trendingHashtags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const clean = tag.replace('#', '');
                          setSearchQuery('#' + clean);
                          setSearchParams({ hashtag: clean });
                        }}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition hover:scale-105 ${
                          darkMode
                            ? 'bg-slate-700 text-primary hover:bg-slate-600'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        <FiHash size={10} />
                        {tag.replace('#', '')}
                        <span className={`ml-1 ${darkMode ? 'text-gray-500' : 'text-text-tertiary'}`}>
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {}
              <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                <FiSearch className="text-primary" size={16} />
                Suggested For You
              </h2>

              <div className="space-y-3">
                {[...getFilteredUsers(suggestedUsers)]
                  .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
                  .map((u) => {
                    const isFollowing = u.followers?.includes(user?._id) || followingUsers.has(u._id);
                    const isBlocked = isUserBlocked(u._id);
                    return (
                      <UserCard
                        key={u._id}
                        user={u}
                        isFollowing={isFollowing}
                        isBlocked={isBlocked}
                        onFollow={() => isFollowing ? handleUnfollow(u._id) : handleFollow(u._id)}
                        onBlock={() => handleBlock(u._id)}
                        onUnblock={() => handleUnblock(u._id)}
                        onMessage={() => handleMessage(u._id)}
                        showBlockButton={false}
                        context="explore"
                        darkMode={darkMode}
                      />
                    );
                  })}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};


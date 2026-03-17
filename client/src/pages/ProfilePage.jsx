import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiLink, FiMessageCircle, FiCamera, FiLock, FiBookmark } from 'react-icons/fi';
import { MainLayout } from '../components/MainLayout';
import { PostCard } from '../components/PostCard';
import { FollowersModal } from '../components/FollowersModal';
import { FollowingModal } from '../components/FollowingModal';
import { UnfollowConfirmModal } from '../components/UnfollowConfirmModal';
import FollowButton from '../components/FollowButton';
import { FollowRequestsPanel } from '../components/FollowRequestsPanel';
import { useUserStore } from '../store/userStore';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useMessageStore } from '../store/messageStore';
import { formatTimeAgo, getUserActiveStatus } from '../utils/helpers';
import { getAvatarUrl, DEFAULT_AVATAR } from '../utils/avatarHelper';
import { getSocket } from '../services/socketService';

export const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { selectedUser, getProfile, follow, unfollow, updateProfile, loading, error } = useUserStore(state => ({ ...state }));
  const { posts, getUserPosts, likePost, unlikePost, deletePost, savedPosts, getSavedPosts } = usePostStore();
  const { user: currentUser, uploadAvatar } = useAuthStore();
  const { darkMode } = useThemeStore();
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', location: '', website: '', backgroundImage: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const typingToCurrentUser = useMessageStore(state => state.typingToCurrentUser);

  useEffect(() => {
    const targetId = userId || currentUser?._id;
    if (targetId && targetId !== 'undefined') {
      getProfile(targetId);
      getUserPosts(targetId);
      if (!userId || userId === currentUser?._id) getSavedPosts();
    }
  }, [userId, currentUser?._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;
    const handleUserOnline = ({ userId: onlineUserId }) => {
      if (onlineUserId === selectedUser._id)
        useUserStore.setState(state => ({ selectedUser: { ...state.selectedUser, isOnline: true } }));
    };
    const handleUserOffline = ({ userId: offlineUserId }) => {
      if (offlineUserId === selectedUser._id)
        useUserStore.setState(state => ({ selectedUser: { ...state.selectedUser, isOnline: false, lastActive: new Date().toISOString() } }));
    };
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    return () => { socket.off('user_online', handleUserOnline); socket.off('user_offline', handleUserOffline); };
  }, [selectedUser?._id]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      if (selectedUser._id !== currentUser._id) {
        const following = selectedUser.followers?.some((follower) => {
          const followerId = follower?._id || follower;
          return followerId?.toString() === currentUser?._id?.toString();
        }) || false;
        setIsFollowing(following);
      }
      setEditForm({
        bio: selectedUser.bio || '',
        location: selectedUser.location || '',
        website: selectedUser.website || '',
        backgroundImage: selectedUser.backgroundImage || '',
      });
    }
  }, [selectedUser, currentUser]);

  const handleConfirmUnfollow = async () => {
    setUnfollowLoading(true);
    try { await unfollow(selectedUser._id); setShowUnfollowModal(false); }
    catch (error) { console.error('Unfollow error:', error?.response?.data?.message || error?.message); }
    finally { setUnfollowLoading(false); }
  };

  const handleSendMessage = async () => {
    if (selectedUser._id === currentUser._id) { alert('❌ You cannot message yourself!'); return; }
    setSendingMessage(true);
    try { navigate('/messages', { state: { recipientId: selectedUser._id } }); }
    catch (error) { alert(`❌ ${error?.response?.data?.message || 'Failed to start message.'}`); }
    finally { setSendingMessage(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAvatarError('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarError('File size must be less than 5MB'); return; }
    setUploadingAvatar(true);
    setAvatarError('');
    try { await uploadAvatar(file); await getProfile(currentUser._id); }
    catch (error) { setAvatarError(error.response?.data?.message || 'Failed to upload avatar'); }
    finally { setUploadingAvatar(false); }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try { await updateProfile(editForm); setEditMode(false); await getProfile(currentUser._id); }
    catch (error) { alert(error.response?.data?.message || 'Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedUser) setEditForm({ bio: selectedUser.bio || '', location: selectedUser.location || '', website: selectedUser.website || '', backgroundImage: selectedUser.backgroundImage || '' });
  };

  const isTypingToMe = useMemo(() => typingToCurrentUser?.has(selectedUser?._id), [typingToCurrentUser, selectedUser]);

  return (
    <MainLayout>
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-text-tertiary">Loading profile...</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`card-lg mb-6 p-4 ${darkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-danger font-semibold mb-2">❌ Error Loading Profile</p>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">Try Again</button>
        </motion.div>
      )}

      {selectedUser && (
        <>
          {}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-lg mb-6">
            {}
            {selectedUser.backgroundImage && (
              <img src={selectedUser.backgroundImage} alt="Background"
                className="w-full h-24 sm:h-32 object-cover rounded-lg mb-4" />
            )}

            {}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {}
              <div className="relative flex-shrink-0 self-start">
                <img
                  src={getAvatarUrl(selectedUser.avatar)}
                  alt={selectedUser.username}
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                {currentUser?._id === selectedUser._id && (
                  <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-full cursor-pointer transition shadow-md bg-primary hover:bg-primary/90">
                    <FiCamera className="text-white text-base sm:text-lg" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                  </label>
                )}
              </div>

              {}
              <div className="flex-1 min-w-0">
                {}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary">
                    {selectedUser.username}
                  </h1>
                  {selectedUser.isOnline === true ? (
                    <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Active Now
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600">
                      {selectedUser.lastActive ? `Last active ${formatTimeAgo(selectedUser.lastActive)}` : 'Offline'}
                    </span>
                  )}
                  {isTypingToMe && (
                    <span className="text-xs font-medium text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5">
                      <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        typing ●●●
                      </motion.span>
                    </span>
                  )}
                </div>

                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-text-secondary'}`}>{selectedUser.bio}</p>

                {uploadingAvatar && <p className="text-sm text-primary mb-2">📸 Uploading avatar...</p>}
                {avatarError && <p className="text-sm text-danger mb-2">❌ {avatarError}</p>}

                {selectedUser.location && (
                  <div className="flex items-center gap-2 text-text-tertiary text-sm mb-1">
                    <FiMapPin size={13} /> {selectedUser.location}
                  </div>
                )}
                {selectedUser.website && (
                  <div className="flex items-center gap-2 text-primary text-sm mb-3">
                    <FiLink size={13} />
                    <a href={selectedUser.website} target="_blank" rel="noreferrer" className="truncate max-w-[200px]">
                      {selectedUser.website}
                    </a>
                  </div>
                )}

                {}
                <div className="flex gap-4 sm:gap-6 mb-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-text-primary">{posts?.length || 0}</p>
                    <p className="text-xs sm:text-sm text-text-tertiary">Posts</p>
                  </div>
                  <motion.button type="button" onClick={() => setShowFollowersModal(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-center cursor-pointer hover:opacity-80">
                    <p className="text-lg sm:text-2xl font-bold text-text-primary">{selectedUser.followers?.length || 0}</p>
                    <p className="text-xs sm:text-sm text-text-tertiary">Followers</p>
                  </motion.button>
                  <motion.button type="button" onClick={() => setShowFollowingModal(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-center cursor-pointer hover:opacity-80">
                    <p className="text-lg sm:text-2xl font-bold text-text-primary">{selectedUser.following?.length || 0}</p>
                    <p className="text-xs sm:text-sm text-text-tertiary">Following</p>
                  </motion.button>
                </div>

                {}
                {currentUser?._id === selectedUser._id ? (
                  <>
                    <button type="button" onClick={() => setEditMode(!editMode)} className="w-full sm:w-auto btn-primary">
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                    <FollowRequestsPanel />
                  </>
                ) : (
                  <div className="flex gap-2 sm:gap-3">
                    <FollowButton targetUser={selectedUser} size="md" className="flex-1"
                      onStateChange={(newState) => { if (newState === 'following') setShowUnfollowModal(false); }} />
                    <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage} disabled={sendingMessage}
                      className={`flex-1 btn-primary flex items-center justify-center gap-2 text-sm ${sendingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <FiMessageCircle size={15} />
                      <span className="hidden xs:inline">Message</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {}
          {editMode && currentUser?._id === selectedUser._id && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-lg mb-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-text-secondary'}`}>Bio</label>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell us about yourself..." maxLength={160}
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400'
                    }`} rows={3} />
                  <p className="text-xs mt-1 text-gray-500">{editForm.bio.length}/160</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-text-secondary'}`}>Location</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country"
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400'
                    }`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-text-secondary'}`}>Website</label>
                  <input type="url" value={editForm.website} onChange={(e) => setEditForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400'
                    }`} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleCancelEdit} disabled={savingProfile}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition text-sm ${
                      darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}>Cancel</button>
                  <button type="button" onClick={handleSaveProfile} disabled={savingProfile}
                    className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {}
          <div className={`flex gap-1 mb-6 p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <button onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'posts' ? 'bg-primary text-white shadow-sm' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>
              Posts
            </button>
            {currentUser?._id === selectedUser._id && (
              <button onClick={() => setActiveTab('saved')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'saved' ? 'bg-primary text-white shadow-sm' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}>
                <FiBookmark size={14} /> Saved
              </button>
            )}
          </div>

          {}
          {activeTab === 'posts' && (
            <div>
              {!selectedUser.isPrivate || isFollowing || currentUser?._id === selectedUser._id ? (
                <>
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard key={post._id} post={post} onLike={likePost} onUnlike={unlikePost}
                        onDelete={deletePost} onComment={() => {}} currentUserId={currentUser?._id} />
                    ))
                  ) : (
                    <p className="text-center text-text-tertiary py-8">No posts yet</p>
                  )}
                </>
              ) : (
                <div className="text-center py-16 card-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <FiLock className="mx-auto text-4xl text-text-tertiary mb-4" />
                  <h3 className="text-xl font-bold">This Account is Private</h3>
                  <p className="text-text-tertiary text-sm mt-1">Follow this account to see their posts.</p>
                </div>
              )}
            </div>
          )}

          {}
          {activeTab === 'saved' && currentUser?._id === selectedUser._id && (
            <div>
              {savedPosts && savedPosts.length > 0 ? (
                savedPosts.map((post) => (
                  <PostCard key={post._id} post={{ ...post, isSaved: true }} onLike={likePost}
                    onUnlike={unlikePost} onDelete={deletePost} onComment={() => {}} currentUserId={currentUser?._id} />
                ))
              ) : (
                <div className="text-center py-16 card-lg">
                  <FiBookmark className="mx-auto text-4xl text-text-tertiary mb-4" />
                  <h3 className="text-xl font-bold text-text-primary">No Saved Posts</h3>
                  <p className="text-text-tertiary mt-2 text-sm">Posts you save will appear here.</p>
                </div>
              )}
            </div>
          )}

          <FollowersModal isOpen={showFollowersModal} onClose={() => setShowFollowersModal(false)}
            followers={selectedUser?.followers || []} targetUserId={selectedUser?._id} />
          <FollowingModal isOpen={showFollowingModal} onClose={() => setShowFollowingModal(false)}
            following={selectedUser?.following || []} targetUserId={selectedUser?._id} />
          <UnfollowConfirmModal isOpen={showUnfollowModal} onClose={() => setShowUnfollowModal(false)}
            onConfirm={handleConfirmUnfollow} user={selectedUser} loading={unfollowLoading} />
        </>
      )}
    </MainLayout>
  );
};


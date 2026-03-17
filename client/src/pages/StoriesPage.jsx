import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/MainLayout';
import { motion } from 'framer-motion';
import { FiImage, FiFileText, FiVideo } from 'react-icons/fi';
import { useStoryStore } from '../store/storyStore';
import { useAuthStore } from '../store/authStore';
import { StoryViewer } from '../components/StoryViewer';
import { buildMediaUrl } from '../utils/helpers';

export const StoriesPage = () => {
  const { createStory, followingStories, getFollowingStories, loading, error } = useStoryStore();
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState('image');
  const [storyFile, setStoryFile] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#7c3aed');
  const [fileError, setFileError] = useState('');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const groupedStories = useMemo(() => {
    if (!followingStories || followingStories.length === 0) return [];

    const grouped = {};
    followingStories.forEach(story => {
      const authorId = story.author?._id || 'unknown';
      if (!grouped[authorId]) {
        grouped[authorId] = {
          user: story.author,
          stories: []
        };
      }
      grouped[authorId].stories.push(story);
    });

    return Object.values(grouped);
  }, [followingStories]);

  const initialIndex = useMemo(() => {
    if (selectedStoryIndex === null) return 0;

    let currentIndex = 0;
    for (let i = 0; i < groupedStories.length; i++) {
      const storyPosition = groupedStories[i].stories.findIndex(
        s => s._id === followingStories[selectedStoryIndex]?._id
      );
      if (storyPosition !== -1) {
        return { userIndex: i, storyIndex: storyPosition };
      }
    }
    return { userIndex: 0, storyIndex: 0 };
  }, [selectedStoryIndex, groupedStories, followingStories]);

  useEffect(() => {
    getFollowingStories();
  }, []);

  const validateFile = (file) => {
    setFileError('');

    if (!file) return true;

    const maxSize = 20 * 1024 * 1024; 
    if (file.size > maxSize) {
      setFileError('File size cannot exceed 20MB');
      return false;
    }

    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = [...imageTypes, ...videoTypes];

    if (!allowedTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV)');
      return false;
    }

    if (videoTypes.includes(file.type)) {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        if (video.duration > 60) {
          setFileError('Video duration cannot exceed 60 seconds');
        }
      };
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setStoryFile(file);
    } else {
      setStoryFile(null);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();

    if (selectedType === 'image' && !storyFile) {
      setFileError('Please select an image');
      return;
    }
    if (selectedType === 'video' && !storyFile) {
      setFileError('Please select a video');
      return;
    }
    if (selectedType === 'text' && !storyText.trim()) {
      setFileError('Please enter some text');
      return;
    }

    try {
      await createStory(storyFile, storyText, backgroundColor);
      setStoryFile(null);
      setStoryText('');
      setBackgroundColor('#7c3aed');
      setFileError('');
    } catch (err) {
      console.error('Failed to create story:', err);
    }
  };

  return (
    <MainLayout>
      {}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-lg mb-6"
      >
        <h2 className="text-xl font-bold text-text-primary mb-4">Create Story</h2>

        <form onSubmit={handleCreateStory} className="space-y-4">
          {}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedType('image');
                setStoryFile(null);
                setFileError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                selectedType === 'image'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary hover:bg-gray-200'
              }`}
            >
              <FiImage className="inline mr-2" /> Image
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedType('video');
                setStoryFile(null);
                setFileError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                selectedType === 'video'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary hover:bg-gray-200'
              }`}
            >
              <FiVideo className="inline mr-2" /> Video
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedType('text');
                setStoryFile(null);
                setFileError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                selectedType === 'text'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary hover:bg-gray-200'
              }`}
            >
              <FiFileText className="inline mr-2" /> Text
            </button>
          </div>

          {selectedType === 'image' && (
            <div>
              <label className="block bg-gray-100 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-200 transition">
                <FiImage className="mx-auto mb-2 text-3xl" />
                <p className="font-medium">Click to upload story image</p>
                <p className="text-sm text-text-tertiary mt-1">Max 20MB • JPEG, PNG, GIF, WebP</p>
                <input
                  id="story_image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {storyFile && (
                <p className="text-sm text-green-600 mt-2">✓ {storyFile.name}</p>
              )}
            </div>
          )}

          {selectedType === 'video' && (
            <div>
              <label className="block bg-gray-100 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-200 transition">
                <FiVideo className="mx-auto mb-2 text-3xl" />
                <p className="font-medium">Click to upload story video</p>
                <p className="text-sm text-text-tertiary mt-1">Max 60 seconds • Max 20MB • MP4, WebM, MOV</p>
                <input
                  id="story_video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {storyFile && (
                <p className="text-sm text-green-600 mt-2">✓ {storyFile.name}</p>
              )}
            </div>
          )}

          {selectedType === 'text' && (
            <>
              <textarea
                id="story_text"
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="What's your story?"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-20"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  {['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#22c55e'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBackgroundColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-10 h-10 rounded-lg transition ${
                          backgroundColor === color
                            ? 'ring-2 ring-offset-2 ring-black'
                            : ''
                        }`}
                      />
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {(fileError || error) && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {fileError || error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Post Story'}
          </motion.button>
        </form>
      </motion.div>

      {}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">Stories from Following</h2>

        {followingStories && followingStories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {followingStories.map((story, index) => (
              <motion.div
                key={story._id}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedStoryIndex(index);
                  setViewerOpen(true);
                }}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
              >
                {story.image ? (
                  <img
                    src={buildMediaUrl(story.image)}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: story.backgroundColor }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <p className="text-white text-center px-4 font-semibold">{story.text}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="font-semibold text-sm">{story.author?.username}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-tertiary py-8">
            No stories from people you follow yet
          </p>
        )}
      </div>

      {viewerOpen && groupedStories.length > 0 && (
        <StoryViewer
          userStories={groupedStories}
          initialUserIndex={initialIndex.userIndex}
          initialStoryIndex={initialIndex.storyIndex}
          onClose={() => {
            setViewerOpen(false);
            setSelectedStoryIndex(null);
          }}
        />
      )}
    </MainLayout>
  );
};


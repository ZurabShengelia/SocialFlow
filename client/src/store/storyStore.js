import { create } from 'zustand';
import { storyAPI } from '../services/apiService';

export const useStoryStore = create((set, get) => ({
  stories: [],
  userStories: [],
  followingStories: [],
  allStories: [], 
  currentStory: null,
  loading: false,
  error: null,

  organizeStories: (ownStories, followingStories, currentUserId) => {
    const organized = [];
    const storyGroups = {};

    if (ownStories && ownStories.length > 0) {
      organized.push({
        user: ownStories[0]?.author,
        stories: ownStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        isOwn: true
      });
    }

    followingStories?.forEach(story => {
      const authorId = story.author?._id?.toString();
      if (!authorId) return;

      if (!storyGroups[authorId]) {
        storyGroups[authorId] = {
          user: story.author,
          stories: [],
          userId: authorId
        };
      }
      storyGroups[authorId].stories.push(story);
    });

    const isViewed = (story, userId) => {
      if (!story.views || !userId) return false;
      return story.views.some(v => 
        (v.viewer?._id?.toString() === userId.toString()) || 
        (v.viewer?.toString?.() === userId.toString())
      );
    };

    Object.values(storyGroups).forEach(group => {
      group.stories.sort((a, b) => {
        const aViewed = isViewed(a, currentUserId);
        const bViewed = isViewed(b, currentUserId);

        if (aViewed !== bViewed) {
          return aViewed ? 1 : -1;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    const groupsArray = Object.values(storyGroups);
    groupsArray.sort((groupA, groupB) => {
      const aHasUnseen = groupA.stories.some(s => !isViewed(s, currentUserId));
      const bHasUnseen = groupB.stories.some(s => !isViewed(s, currentUserId));

      if (aHasUnseen !== bHasUnseen) {
        return aHasUnseen ? -1 : 1;
      }

      const getNewestDate = (group) => new Date(group.stories[0]?.createdAt || 0);
      return getNewestDate(groupB) - getNewestDate(groupA);
    });

    organized.push(...groupsArray);

    return organized;
  },

  createStory: async (image, text, backgroundColor) => {
    set({ loading: true, error: null });
    try {
      const { data } = await storyAPI.createStory(image, text, backgroundColor);
      set({ 
        userStories: [data.data, ...get().userStories],
        loading: false 
      });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create story', loading: false });
      throw error;
    }
  },

  getUserStories: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await storyAPI.getUserStories(userId);
      set({ userStories: data.data, loading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch user stories', loading: false });
      throw error;
    }
  },

  getAllStories: async (currentUserId) => {
    set({ loading: true, error: null });
    try {

      const ownResponse = await storyAPI.getUserStories(currentUserId);
      const ownStories = ownResponse.data.data || [];

      const followingResponse = await storyAPI.getFollowingStories();
      const followingStories = followingResponse.data.data || [];

      const organizeStories = get().organizeStories;
      const allStories = organizeStories(ownStories, followingStories, currentUserId);

      set({ 
        allStories,
        userStories: ownStories,
        followingStories,
        loading: false 
      });
      return allStories;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch stories', loading: false });
      throw error;
    }
  },

  getFollowingStories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await storyAPI.getFollowingStories();
      set({ followingStories: data.data, loading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch stories', loading: false });
      throw error;
    }
  },

  viewStory: async (storyId) => {
    try {
      const { data } = await storyAPI.viewStory(storyId);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  deleteStory: async (storyId) => {
    try {
      await storyAPI.deleteStory(storyId);
      set({
        userStories: get().userStories.filter(s => s._id !== storyId),
        stories: get().stories.filter(s => s._id !== storyId)
      });
    } catch (error) {
      throw error;
    }
  },

  likeStory: async (storyId) => {
    try {
      console.log('❤️ STORY STORE: likeStory called, storyId:', storyId);
      const { data } = await storyAPI.likeStory(storyId);

      set({
        followingStories: get().followingStories.map(s => 
          s._id === storyId ? data.data : s
        )
      });

      console.log('✅ STORY STORE: likeStory success');
      return data.data;
    } catch (error) {
      console.error('🔴 STORY STORE: likeStory error:', error.message);
      throw error;
    }
  },

  unlikeStory: async (storyId) => {
    try {
      console.log('🤍 STORY STORE: unlikeStory called, storyId:', storyId);
      const { data } = await storyAPI.unlikeStory(storyId);

      set({
        followingStories: get().followingStories.map(s => 
          s._id === storyId ? data.data : s
        )
      });

      console.log('✅ STORY STORE: unlikeStory success');
      return data.data;
    } catch (error) {
      console.error('🔴 STORY STORE: unlikeStory error:', error.message);
      throw error;
    }
  },

  replyToStory: async (storyId, text) => {
    try {
      if (!text || !text.trim()) {
        throw new Error('Reply text cannot be empty');
      }

      console.log('💬 STORY STORE: replyToStory called, storyId:', storyId, 'text:', text);
      const { data } = await storyAPI.replyToStory(storyId, text);

      set({
        followingStories: get().followingStories.map(s => 
          s._id === storyId ? data.data : s
        )
      });

      console.log('✅ STORY STORE: replyToStory success');
      return data.data;
    } catch (error) {
      console.error('🔴 STORY STORE: replyToStory error:', error.message);
      throw error;
    }
  },

  reactToStory: async (storyId, emoji) => {
    try {
      console.log('😊 STORY STORE: reactToStory called, storyId:', storyId, 'emoji:', emoji);
      const { data } = await storyAPI.reactToStory(storyId, emoji);

      set({
        followingStories: get().followingStories.map(s => 
          s._id === storyId ? data.data : s
        )
      });

      console.log('✅ STORY STORE: reactToStory success');
      return data.data;
    } catch (error) {
      console.error('🔴 STORY STORE: reactToStory error:', error.message);
      throw error;
    }
  },

  removeReaction: async (storyId) => {
    try {
      console.log('😊 STORY STORE: removeReaction called, storyId:', storyId);
      const { data } = await storyAPI.removeReaction(storyId);

      set({
        followingStories: get().followingStories.map(s => 
          s._id === storyId ? data.data : s
        )
      });

      console.log('✅ STORY STORE: removeReaction success');
      return data.data;
    } catch (error) {
      console.error('🔴 STORY STORE: removeReaction error:', error.message);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));


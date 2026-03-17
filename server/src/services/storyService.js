import Story from '../models/Story.js';
import User from '../models/User.js';
import { MessageService } from './messageService.js';

export class StoryService {
  static async createStory(authorId, fileData = null, text = '', backgroundColor = '#ffffff', videoDuration = null) {

    if (!fileData && !text) {
      throw new Error('Story must contain either an image/video or text');
    }

    const storyData = {
      author: authorId,
      text,
      backgroundColor
    };

    if (fileData) {
      const isVideo = fileData.mimetype && fileData.mimetype.startsWith('video/');
      console.log(`📹 Story upload - MIME: ${fileData.mimetype}, isVideo: ${isVideo}, filename: ${fileData.filename}`);

      if (isVideo) {
        storyData.videoUrl = `/uploads/${fileData.filename}`;
        console.log(`✅ Video story created: ${storyData.videoUrl}`);

        if (videoDuration) {
          if (videoDuration > 60) {
            throw new Error('Video duration cannot exceed 60 seconds');
          }
          storyData.videoDuration = videoDuration;
        }
      } else {
        storyData.image = `/uploads/${fileData.filename}`;
        console.log(`🖼️ Image story created: ${storyData.image}`);
      }
    }

    const story = new Story(storyData);
    await story.save();
    return story.populate('author', 'username avatar');
  }

  static async getUserStories(userId) {
    const now = new Date();

    const stories = await Story.find({
      author: userId,
      expiresAt: { $gt: now }
    })
      .populate('author', 'username avatar')
      .populate('views.viewer', 'username avatar')
      .populate('reactions.user', 'username avatar')
      .sort({ createdAt: -1 });

    return stories.filter(story => {
      if (story.expiresAt < now) {
        console.log(`⏰ STORY EXPIRED: Filtering out expired story ${story._id}`);
        return false;
      }
      return true;
    });
  }

  static async getFollowingStories(userId) {
    const user = await User.findById(userId).select('following');
    const followingIds = user.following || [];

    const now = new Date();

    const stories = await Story.find({
      author: { $in: followingIds },
      expiresAt: { $gt: now }
    })
      .populate('author', 'username avatar')
      .populate('views.viewer', 'username avatar')
      .populate('reactions.user', 'username avatar')
      .sort({ createdAt: -1 });

    return stories.filter(story => {
      if (story.expiresAt < now) {
        console.log(`⏰ STORY EXPIRED: Filtering out expired story ${story._id}`);
        return false;
      }
      return true;
    });
  }

  static async viewStory(storyId, viewerId) {
    const story = await Story.findById(storyId);

    if (!story) {
      throw new Error('Story not found');
    }

    const now = new Date();
    if (story.expiresAt < now) {
      throw new Error('Story has expired');
    }

    if (story.author.toString() === viewerId.toString()) {
      console.log('📖 STORY VIEW: Author viewing own story - skipping view recording');
      return await story.populate('views.viewer', 'username avatar');
    }

    const alreadyViewed = story.views.some(v => v.viewer.toString() === viewerId.toString());

    if (!alreadyViewed) {
      story.views.push({
        viewer: viewerId,
        viewedAt: new Date()
      });
      await story.save();
      console.log(`📖 STORY VIEW: New view recorded from ${viewerId}`);
    } else {
      console.log(`📖 STORY VIEW: User ${viewerId} already viewed this story - no duplicate`);
    }

    return await story.populate('views.viewer', 'username avatar');
  }

  static async deleteStory(storyId, userId) {
    const story = await Story.findById(storyId);

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.author.toString() !== userId) {
      throw new Error('Not authorized to delete this story');
    }

    await Story.findByIdAndDelete(storyId);
    return { message: 'Story deleted' };
  }

  static async likeStory(storyId, userId) {
    const story = await Story.findById(storyId);

    if (!story) {
      throw new Error('Story not found');
    }

    const isLiked = story.likes.includes(userId);
    if (isLiked) {
      throw new Error('Story already liked');
    }

    story.likes.push(userId);
    await story.save();

    return story.populate([
      { path: 'author', select: 'username avatar' },
      { path: 'likes', select: 'username avatar' }
    ]);
  }

  static async unlikeStory(storyId, userId) {
    const story = await Story.findById(storyId);

    if (!story) {
      throw new Error('Story not found');
    }

    story.likes = story.likes.filter(id => id.toString() !== userId);
    await story.save();

    return story.populate([
      { path: 'author', select: 'username avatar' },
      { path: 'likes', select: 'username avatar' }
    ]);
  }

  static async reactToStory(storyId, userId, emoji) {
    const validEmojis = ['❤️', '😂', '🔥'];
    if (!validEmojis.includes(emoji)) {
      throw new Error('Invalid emoji reaction');
    }

    const story = await Story.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const now = new Date();
    if (story.expiresAt < now) {
      throw new Error('Story has expired');
    }

    const existingReaction = story.reactions.find(r => r.user.toString() === userId.toString());

    if (existingReaction) {
      console.log(`😊 REACTION UPDATE: User ${userId} changed reaction from ${existingReaction.emoji} to ${emoji}`);

      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date();
    } else {
      console.log(`😊 REACTION NEW: User ${userId} added reaction ${emoji}`);

      story.reactions.push({
        user: userId,
        emoji,
        createdAt: new Date()
      });
    }

    await story.save();

    return story.populate([
      { path: 'author', select: 'username avatar' },
      { path: 'reactions.user', select: 'username avatar' }
    ]);
  }

  static async removeReaction(storyId, userId) {
    const story = await Story.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const now = new Date();
    if (story.expiresAt < now) {
      throw new Error('Story has expired');
    }

    const beforeCount = story.reactions.length;
    story.reactions = story.reactions.filter(r => r.user.toString() !== userId.toString());
    const afterCount = story.reactions.length;

    if (beforeCount > afterCount) {
      console.log(`😊 REACTION REMOVED: User ${userId} removed their reaction`);
      await story.save();
    }

    return story.populate([
      { path: 'author', select: 'username avatar' },
      { path: 'reactions.user', select: 'username avatar' }
    ]);
  }

  static async replyToStory(storyId, userId, text) {
    const story = await Story.findById(storyId).populate('author');

    if (!story) {
      throw new Error('Story not found');
    }

    const now = new Date();
    if (story.expiresAt < now) {
      throw new Error('Story has expired');
    }

    if (story.author._id.toString() === userId.toString()) {
      throw new Error('You cannot reply to your own story.');
    }

    story.replies.push({
      author: userId,
      text,
      createdAt: new Date()
    });

    const conversation = await MessageService.getOrCreateConversation(userId, story.author._id);

    const storyMediaUrl = story.image || story.videoUrl;
    const message = await MessageService.sendMessage(
      conversation._id,
      userId,
      story.author._id,
      text,
      null, 
      null,
      { storyId: story._id, storyMediaUrl }
    );

    await story.save();

    return message;
  }
}


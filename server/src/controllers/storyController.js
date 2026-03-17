import { StoryService } from '../services/storyService.js';
import { NotificationService } from '../services/notificationService.js';
import { getSocketInstance } from '../config/socketInstance.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

const getVideoDuration = async (filePath) => {
  try {

    return null;
  } catch (error) {
    console.log('⚠️ Could not extract video duration:', error.message);
    return null;
  }
};

export class StoryController {
  static async createStory(req, res) {
    try {
      const { text, backgroundColor } = req.body;
      const fileData = req.file;

      if (!fileData && !text) {
        return sendError(res, 'Story must contain either an image/video or text', 400);
      }

      let videoDuration = null;

      if (fileData && fileData.mimetype.startsWith('video/')) {
        videoDuration = await getVideoDuration(fileData.path);
      }

      const story = await StoryService.createStory(
        req.userId,
        fileData,
        text || '',
        backgroundColor || '#ffffff',
        videoDuration
      );

      sendSuccess(res, story, 'Story created', 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getUserStories(req, res) {
    try {
      const stories = await StoryService.getUserStories(req.params.userId);
      sendSuccess(res, stories, 'User stories retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getFollowingStories(req, res) {
    try {
      const stories = await StoryService.getFollowingStories(req.userId);
      sendSuccess(res, stories, 'Following stories retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async viewStory(req, res) {
    try {
      const story = await StoryService.viewStory(req.params.storyId, req.userId);
      sendSuccess(res, story, 'Story viewed');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async deleteStory(req, res) {
    try {
      const result = await StoryService.deleteStory(req.params.storyId, req.userId);
      sendSuccess(res, result, 'Story deleted');
    } catch (error) {
      sendError(res, error.message, error.message === 'Not authorized to delete this story' ? 403 : 400);
    }
  }

  static async likeStory(req, res) {
    try {
      console.log('💙 STORY CONTROLLER: likeStory - storyId:', req.params.storyId, 'userId:', req.userId);
      const story = await StoryService.likeStory(req.params.storyId, req.userId);

      if (story.author._id.toString() !== req.userId.toString()) {
        const notification = await NotificationService.createNotification(
          story.author._id,
          req.userId,
          'story_like',
          req.params.storyId,
          null,
          `liked your story`
        );

        if (notification) {
          try {
            const io = getSocketInstance();
            io.to(`user_${story.author._id}`).emit('notification', notification);
            console.log('📬 Notification emitted for story like');
          } catch (socketError) {
            console.log('⚠️ Socket not available for notification:', socketError.message);
          }
        }
      }

      sendSuccess(res, story, 'Story liked');
    } catch (error) {
      console.error('🔴 STORY CONTROLLER: likeStory error:', error.message);
      sendError(res, error.message, 400);
    }
  }

  static async unlikeStory(req, res) {
    try {
      console.log('🤍 STORY CONTROLLER: unlikeStory - storyId:', req.params.storyId, 'userId:', req.userId);
      const story = await StoryService.unlikeStory(req.params.storyId, req.userId);
      sendSuccess(res, story, 'Story unliked');
    } catch (error) {
      console.error('🔴 STORY CONTROLLER: unlikeStory error:', error.message);
      sendError(res, error.message, 400);
    }
  }

  static async reactToStory(req, res) {
    try {
      const { emoji } = req.body;
      if (!emoji) {
        return sendError(res, 'Emoji is required', 400);
      }

      console.log('😊 STORY CONTROLLER: reactToStory - storyId:', req.params.storyId, 'userId:', req.userId, 'emoji:', emoji);
      const story = await StoryService.reactToStory(req.params.storyId, req.userId, emoji);

      if (story.author._id.toString() !== req.userId.toString()) {
        const notification = await NotificationService.createNotification(
          story.author._id,
          req.userId,
          'story_reaction',
          req.params.storyId,
          null,
          `reacted with ${emoji} to your story`
        );

        if (notification) {
          try {
            const io = getSocketInstance();
            io.to(`user_${story.author._id}`).emit('notification', notification);
            console.log('📬 Notification emitted for story reaction');
          } catch (socketError) {
            console.log('⚠️ Socket not available for notification:', socketError.message);
          }
        }
      }

      sendSuccess(res, story, 'Reaction added');
    } catch (error) {
      console.error('🔴 STORY CONTROLLER: reactToStory error:', error.message);
      sendError(res, error.message, 400);
    }
  }

  static async removeReaction(req, res) {
    try {
      console.log('😊 STORY CONTROLLER: removeReaction - storyId:', req.params.storyId, 'userId:', req.userId);
      const story = await StoryService.removeReaction(req.params.storyId, req.userId);
      sendSuccess(res, story, 'Reaction removed');
    } catch (error) {
      console.error('🔴 STORY CONTROLLER: removeReaction error:', error.message);
      sendError(res, error.message, 400);
    }
  }

  static async replyToStory(req, res) {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return sendError(res, 'Reply text is required', 400);
      }

      console.log('💬 STORY CONTROLLER: replyToStory - storyId:', req.params.storyId, 'userId:', req.userId, 'text:', text);
      const message = await StoryService.replyToStory(req.params.storyId, req.userId, text);

      const io = getSocketInstance();

      io.to(`user_${message.receiver._id}`).emit('new_message', message);
      console.log(`📨 New message sent in conversation ${message.conversationId}`);

      const notification = await NotificationService.createNotification(
        message.receiver._id,
        req.userId,
        'story_reply',
        req.params.storyId,
        null,
        `replied to your story`
      );

      if (notification) {
        io.to(`user_${message.receiver._id}`).emit('notification', notification);
        console.log('📬 Notification emitted for story reply');
      }

      sendSuccess(res, message, 'Reply sent as a message');
    } catch (error) {
      console.error('🔴 STORY CONTROLLER: replyToStory error:', error.message);
      sendError(res, error.message, 400);
    }
  }
}


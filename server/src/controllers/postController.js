import { PostService } from '../services/postService.js';
import { NotificationService } from '../services/notificationService.js';
import { getSocketInstance } from '../config/socketInstance.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

export class PostController {
  static async createPost(req, res) {
    try {
      const { text } = req.body;
      const image = req.file ? req.file.path : null;
      if (!text && !image) return sendError(res, 'Post must contain text or image', 400);
      const post = await PostService.createPost(req.userId, text, image);
      sendSuccess(res, post, 'Post created', 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getPost(req, res) {
    try {
      const post = await PostService.getPost(req.params.postId);
      if (!post) return sendError(res, 'Post not found', 404);
      sendSuccess(res, post, 'Post retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async deletePost(req, res) {
    try {
      const result = await PostService.deletePost(req.params.postId, req.userId);
      sendSuccess(res, result, 'Post deleted');
    } catch (error) {
      sendError(res, error.message, error.message === 'Not authorized to delete this post' ? 403 : 400);
    }
  }

  static async likePost(req, res) {
    try {
      const post = await PostService.likePost(req.params.postId, req.userId);

      if (post.author._id.toString() !== req.userId.toString()) {
        const notification = await NotificationService.createNotification(
          post.author._id, req.userId, 'like_post', req.params.postId, null, 'liked your post'
        );
        if (notification) {
          try {
            const io = getSocketInstance();
            io.to(`user_${post.author._id}`).emit('notification', notification);
          } catch (socketError) {
            console.log('⚠️ Socket not available for notification:', socketError.message);
          }
        }
      }

      sendSuccess(res, post, 'Post liked');
    } catch (error) {
      if (error.message === 'Already liked this post') return sendError(res, error.message, 400);
      sendError(res, error.message, 400);
    }
  }

  static async unlikePost(req, res) {
    try {
      const post = await PostService.unlikePost(req.params.postId, req.userId);
      sendSuccess(res, post, 'Post unliked');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async savePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      const User = (await import('../models/User.js')).default;
      const Post = (await import('../models/Post.js')).default;
      const user = await User.findById(userId);
      if (!user) return sendError(res, 'User not found', 404);
      const alreadySaved = user.savedPosts.some(id => id.toString() === postId);
      if (alreadySaved) return sendError(res, 'Post already saved', 400);
      await User.findByIdAndUpdate(userId, { $addToSet: { savedPosts: postId } });
      await Post.findByIdAndUpdate(postId, { $addToSet: { savedBy: userId } });
      sendSuccess(res, { saved: true }, 'Post saved');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async unsavePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      const User = (await import('../models/User.js')).default;
      const Post = (await import('../models/Post.js')).default;
      await User.findByIdAndUpdate(userId, { $pull: { savedPosts: postId } });
      await Post.findByIdAndUpdate(postId, { $pull: { savedBy: userId } });
      sendSuccess(res, { saved: false }, 'Post unsaved');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getSavedPosts(req, res) {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.userId).populate({
        path: 'savedPosts',
        populate: { path: 'author', select: 'username avatar isOnline' },
        options: { sort: { createdAt: -1 } }
      });
      if (!user) return sendError(res, 'User not found', 404);
      sendSuccess(res, user.savedPosts || [], 'Saved posts retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getFeed(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const posts = await PostService.getFeed(req.userId, page);
      sendSuccess(res, posts, 'Feed retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getUserPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const posts = await PostService.getUserPosts(req.params.userId, page);
      sendSuccess(res, posts, 'User posts retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getPostsByHashtag(req, res) {
    try {
      const { hashtag } = req.params;
      const page = parseInt(req.query.page) || 1;
      if (!hashtag) return sendError(res, 'Hashtag is required', 400);
      const posts = await PostService.getPostsByHashtag(hashtag, req.userId, page);
      sendSuccess(res, posts, `Posts for #${hashtag}`);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getTrendingHashtags(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const hashtags = await PostService.getTrendingHashtags(limit);
      sendSuccess(res, hashtags, 'Trending hashtags retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getExplore(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const recentPosts = await PostService.getExplorePosts(req.userId, page);
      const suggestedUsers = await PostService.getSuggestedUsers(req.userId, 8);
      sendSuccess(res, { recentPosts, suggestedUsers }, 'Explore data retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}


import { CommentService } from '../services/commentService.js';
import { NotificationService } from '../services/notificationService.js';
import { getSocketInstance } from '../config/socketInstance.js';
import { PostService } from '../services/postService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

export class CommentController {
  static async createComment(req, res) {
    try {
      const { text } = req.body;
      const comment = await CommentService.createComment(req.params.postId, req.userId, text);

      const post = await PostService.getPost(req.params.postId);

      if (post && post.author._id.toString() !== req.userId.toString()) {
        const notification = await NotificationService.createNotification(
          post.author._id,
          req.userId,
          'comment_post',
          req.params.postId,
          null,
          `commented on your post`
        );

        if (notification) {

          try {
            const io = getSocketInstance();
            io.to(`user_${post.author._id}`).emit('notification', notification);
            console.log('📬 Notification emitted for comment');
          } catch (socketError) {
            console.log('⚠️ Socket not available for notification:', socketError.message);
          }
        }
      }

      sendSuccess(res, comment, 'Comment created', 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async getPostComments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const comments = await CommentService.getPostComments(req.params.postId, page);
      sendSuccess(res, comments, 'Comments retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async deleteComment(req, res) {
    try {
      const result = await CommentService.deleteComment(req.params.commentId, req.userId);
      sendSuccess(res, result, 'Comment deleted');
    } catch (error) {
      sendError(res, error.message, error.message === 'Not authorized to delete this comment' ? 403 : 400);
    }
  }

  static async likeComment(req, res) {
    try {
      const comment = await CommentService.likeComment(req.params.commentId, req.userId);

      if (comment.author._id.toString() !== req.userId.toString()) {
        const notification = await NotificationService.createNotification(
          comment.author._id,
          req.userId,
          'like_comment',
          req.params.commentId,
          null,
          `liked your comment`
        );

        if (notification) {

          try {
            const io = getSocketInstance();
            io.to(`user_${comment.author._id}`).emit('notification', notification);
            console.log('📬 Notification emitted for comment like');
          } catch (socketError) {
            console.log('⚠️ Socket not available for notification:', socketError.message);
          }
        }
      }

      sendSuccess(res, comment, 'Comment liked');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async unlikeComment(req, res) {
    try {
      const comment = await CommentService.unlikeComment(req.params.commentId, req.userId);
      sendSuccess(res, comment, 'Comment unliked');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }
}


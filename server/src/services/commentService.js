import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export class CommentService {
  static async createComment(postId, authorId, text) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    const comment = new Comment({
      postId,
      author: authorId,
      text
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    return comment.populate('author', 'username avatar');
  }

  static async getPostComments(postId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return Comment.find({ postId, parentComment: null })
      .populate('author', 'username avatar')
      .populate('replies')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    const post = await Post.findById(comment.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const isCommentAuthor = comment.author.toString() === userId.toString();
    const isPostOwner = post.author.toString() === userId.toString();

    if (!isCommentAuthor && !isPostOwner) {
      throw new Error('Not authorized to delete this comment');
    }

    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: commentId }
    });

    await Comment.findByIdAndDelete(commentId);
    return { message: 'Comment deleted' };
  }

  static async likeComment(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.likes.includes(userId)) {
      throw new Error('Already liked this comment');
    }

    comment.likes.push(userId);
    await comment.save();

    return comment;
  }

  static async unlikeComment(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.likes = comment.likes.filter(id => id.toString() !== userId);
    await comment.save();

    return comment;
  }
}


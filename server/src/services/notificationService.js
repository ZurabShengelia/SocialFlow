import Notification from '../models/Notification.js';
import User from '../models/User.js';

export class NotificationService {

  static async createNotification(
    recipientId, senderId, type, resourceId = null, storyId = null, text = ''
  ) {

    if (recipientId?.toString() === senderId?.toString()) {
      return null;
    }

    const recipient = await User.findById(recipientId).select('notificationSettings');
    if (!recipient) return null;
    if (!recipient.notificationSettings?.push) {
      console.log(`⚠️  Push notifications disabled for user ${recipientId} – skipping`);
      return null;
    }

    const notificationData = {
      recipient: recipientId,
      sender: senderId,
      type,
      text,
    };

    if (type === 'like_post' || type === 'comment_post') {
      notificationData.postId = resourceId;
    } else if (type === 'like_comment') {
      notificationData.commentId = resourceId;
    } else if (type === 'story_like' || type === 'story_reply') {
      notificationData.storyId = resourceId;
    }

    const notification = new Notification(notificationData);
    await notification.save();
    return await notification.populate('sender', 'username avatar');
  }

  static async getNotifications(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select('notificationSettings');
    if (!user?.notificationSettings?.push) return [];

    return Notification.find({ recipient: userId })
      .populate('sender', 'username avatar')
      .populate('postId', 'text image')
      .populate('commentId', 'text')
      .populate('storyId', 'image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async getUnreadCount(userId) {

    return Notification.countDocuments({ recipient: userId, isRead: false });
  }

  static async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  static async deleteNotification(notificationId) {
    await Notification.findByIdAndDelete(notificationId);
    return { message: 'Notification deleted' };
  }
}


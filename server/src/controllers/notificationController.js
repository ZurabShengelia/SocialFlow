import { NotificationService } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

export class NotificationController {
  static async getNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;

      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.userId).select('notificationSettings');
      if (!user?.notificationSettings?.push) {
        return sendSuccess(res, [], 'Notifications retrieved');
      }

      const notifications = await NotificationService.getNotifications(req.userId, page);
      sendSuccess(res, notifications, 'Notifications retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.userId).select('notificationSettings');

      if (!user?.notificationSettings?.push) {
        return sendSuccess(res, { count: 0 }, 'Unread count retrieved');
      }

      const count = await NotificationService.getUnreadCount(req.userId);
      sendSuccess(res, { count }, 'Unread count retrieved');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async markAsRead(req, res) {
    try {
      const notification = await NotificationService.markAsRead(req.params.notificationId);
      if (!notification) {
        return sendError(res, 'Notification not found', 404);
      }
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  static async markAllAsRead(req, res) {
    try {
      await NotificationService.markAllAsRead(req.userId);
      sendSuccess(res, {}, 'All notifications marked as read');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async deleteNotification(req, res) {
    try {
      const result = await NotificationService.deleteNotification(req.params.notificationId);
      sendSuccess(res, result, 'Notification deleted');
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }
}


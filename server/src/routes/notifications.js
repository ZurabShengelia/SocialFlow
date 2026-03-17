import express from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, NotificationController.getNotifications);
router.get('/unread/count', authMiddleware, NotificationController.getUnreadCount);
router.put('/read/all', authMiddleware, NotificationController.markAllAsRead);
router.put('/:notificationId/read', authMiddleware, NotificationController.markAsRead);
router.delete('/:notificationId', authMiddleware, NotificationController.deleteNotification);

export default router;


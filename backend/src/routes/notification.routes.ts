import express from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All routes are protected
router.get('/', authenticateToken, NotificationController.getUserNotifications);
router.get('/unread', authenticateToken, NotificationController.getUnreadNotifications);
router.put('/:id/read', authenticateToken, NotificationController.markAsRead);
router.put('/read-all', authenticateToken, NotificationController.markAllAsRead);
router.delete('/:id', authenticateToken, NotificationController.deleteNotification);

export default router; 
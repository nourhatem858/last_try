/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');
const { validateNotificationId } = require('../middlewares/notificationValidation');

// All notification routes are protected
router.get('/', protect, getUserNotifications);
router.patch('/read-all', protect, markAllAsRead);
router.delete('/read', protect, deleteReadNotifications);
router.patch('/:id/read', protect, validateNotificationId, markAsRead);
router.delete('/:id', protect, validateNotificationId, deleteNotification);

module.exports = router;

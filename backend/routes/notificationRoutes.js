const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
  sendNotification,
  subscribePush
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getUserNotifications)
  .post(protect, admin, sendNotification); // Admin sending manual notification

router.post('/subscribe', protect, subscribePush);

router.get('/unread-count', protect, getUnreadCount);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router;

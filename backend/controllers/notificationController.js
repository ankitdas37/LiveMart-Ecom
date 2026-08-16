const { Notification, User, PushSubscription } = require('../models');
const { emitToUser, broadcastToAll } = require('../socket/socketManager');
const { sendWebPush } = require('../utils/webPush');


// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
exports.subscribePush = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    
    if (!endpoint || !keys) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    // Check if subscription already exists for this endpoint
    const existing = await PushSubscription.findOne({ where: { endpoint } });
    if (existing) {
      // Update userId if it belongs to someone else (e.g. new user logged in on same browser)
      existing.userId = req.user.id;
      existing.p256dh = keys.p256dh;
      existing.auth = keys.auth;
      await existing.save();
    } else {
      await PushSubscription.create({
        userId: req.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      });
    }

    res.status(201).json({ message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('Subscribe push error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 100 // keep it reasonable
    });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread notification count for logged in user
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    res.json({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark a notification as read (or all)
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.destroy({ where: { userId: req.user.id } });
      return res.json({ message: 'All notifications deleted' });
    }

    const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send manual notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type, sendToAll } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const pushPayload = { title, message, url: '/profile?tab=notifications' };

    if (sendToAll) {
      const users = await User.findAll({ attributes: ['id'] });
      const notifications = users.map(user => ({
        userId: user.id,
        title,
        message,
        type: type || 'admin',
        isRead: false
      }));
      
      const createdNotifs = await Notification.bulkCreate(notifications, { returning: true });

      // Emit real-time to all connected users
      const notifPayload = {
        title,
        message,
        type: type || 'admin',
        isRead: false,
        createdAt: new Date()
      };
      broadcastToAll(notifPayload);

      // Send Web Push to all users
      for (const u of users) {
        await sendWebPush(u.id, pushPayload);
      }

      return res.status(201).json({ message: `Notification sent to ${users.length} users`, count: createdNotifs.length });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required if not sending to all' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'admin',
      isRead: false
    });

    // Emit real-time to the specific user
    emitToUser(userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: false,
      createdAt: notification.createdAt
    });

    // Send Web Push
    await sendWebPush(userId, pushPayload);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


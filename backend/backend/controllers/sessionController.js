const { Session, LoginActivity } = require('../models');
const { Op } = require('sequelize');

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { userEmail: req.user.email },
      order: [['last_active', 'DESC']],
    });
    // Add a flag to indicate the current session
    const sessionsWithCurrentFlag = sessions.map((session) => ({
      ...session.toJSON(),
      is_current: session.id === req.sessionId,
    }));
    res.json(sessionsWithCurrentFlag);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOne({ where: { id } });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user is owner or admin
    if (session.userEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await session.destroy();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.revokeAllOtherSessions = async (req, res) => {
  try {
    const currentSessionId = req.sessionId;
    if (!currentSessionId) {
      return res.status(400).json({ message: 'Current session ID not found' });
    }

    // Destroy all sessions for this user EXCEPT the current one
    if (currentSessionId) {
      await Session.destroy({
        where: {
          userEmail: req.user.email,
          id: {
            [Op.ne]: currentSessionId
          }
        }
      });
      res.json({ message: 'All other sessions deleted from database' });
    } else {
      // Legacy token fallback - do not delete to prevent accidental self-logout
      res.status(400).json({ message: 'Cannot verify current session safely. Please re-login.' });
    }
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLoginActivity = async (req, res) => {
  try {
    const activities = await LoginActivity.findAll({
      where: { email: req.user.email },
      order: [['timestamp', 'DESC']],
      limit: 50,
    });
    res.json(activities);
  } catch (error) {
    console.error('Get login activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteLoginActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await LoginActivity.findOne({ where: { id } });
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this activity' });
    }

    await activity.destroy();
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete login activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clearAllLoginActivity = async (req, res) => {
  try {
    await LoginActivity.destroy({
      where: { email: req.user.email }
    });
    res.json({ message: 'All login history cleared' });
  } catch (error) {
    console.error('Clear login activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    // Destroy all sessions for this user
    await Session.destroy({
      where: { userEmail: req.user.email }
    });
    res.json({ message: 'Successfully logged out of all devices' });
  } catch (error) {
    console.error('Global logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

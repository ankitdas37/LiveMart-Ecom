const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Session validation
      if (decoded.sessionId) {
        const session = await Session.findByPk(decoded.sessionId);
        if (!session || session.is_revoked) {
          return res.status(401).json({ message: 'Session expired or revoked. Please login again.' });
        }
        // Update last_active if more than 5 minutes have passed
        const fiveMinutes = 5 * 60 * 1000;
        if (new Date() - new Date(session.last_active) > fiveMinutes) {
          session.last_active = new Date();
          await session.save();
        }
        req.sessionId = decoded.sessionId;
      } else {
        // Enforce session tracking by rejecting old tokens without sessionId
        return res.status(401).json({ message: 'Session expired or revoked. Please login again.' });
      }

      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };

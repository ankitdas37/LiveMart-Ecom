/**
 * socketManager.js
 * Manages Socket.IO connections and user room mapping.
 * Each authenticated user joins their own private room: "user_<id>"
 */

let io = null;

// Map of userId -> Set of socketIds (one user can have multiple tabs)
const userSockets = new Map();

const initSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client sends their userId and optionally sessionId after connecting
    socket.on('join', (data) => {
      if (!data) return;
      
      let userId, sessionId;
      if (typeof data === 'object') {
        userId = data.userId;
        sessionId = data.sessionId;
      } else {
        userId = data;
      }

      if (!userId) return;

      const room = `user_${userId}`;
      socket.join(room);
      
      if (sessionId) {
        socket.join(`session_${sessionId}`);
      }

      // Track the mapping
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      console.log(`👤 User ${userId} joined room ${room} ${sessionId ? `and session_${sessionId}` : ''} (socket: ${socket.id})`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Clean up from map
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
          break;
        }
      }
    });
  });
};

/**
 * Emit a real-time notification to a specific user
 * @param {number|string} userId 
 * @param {object} notification  - { id, title, message, type, isRead, createdAt }
 */
const emitToUser = (userId, notification) => {
  if (!io) return;
  io.to(`user_${userId}`).emit('notification', notification);
  console.log(`📨 Emitted notification to user_${userId}: ${notification.title}`);
};

/**
 * Broadcast a notification to ALL connected users
 * @param {object} notification 
 */
const broadcastToAll = (notification) => {
  if (!io) return;
  io.emit('notification', notification);
  console.log(`📢 Broadcast notification to all users: ${notification.title}`);
};

/**
 * Get the initialized io instance
 */
const getIO = () => io;

module.exports = { initSocket, emitToUser, broadcastToAll, getIO };

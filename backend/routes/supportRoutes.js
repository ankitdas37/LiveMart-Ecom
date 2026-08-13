const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  replyToTicket,
  sendDirectEmail,
  getEmailHistory,
  getOrderTickets,
  getUserTickets,
  deleteTicket,
  bulkDeleteTickets
} = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');

const multer = require('multer');

// Configure multer to store files only in RAM (memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public route for frontend
router.post('/', createTicket);
router.get('/order/:orderId', getOrderTickets); // Usually order tickets might need some form of auth if checking status by order ID without login, but let's assume it checks order email or is public. Wait, let's keep it as is if it's public. Actually, if it takes orderId, it might expose ticket info. Let's look at order tickets. To be safe, if a user accesses their order tickets, they should be logged in or have a specific token. For now, leave as is if it was intended to be public for guest orders.

// Protected user routes
router.get('/my-tickets', protect, getUserTickets);

// Admin routes
router.get('/', protect, admin, getTickets);
router.get('/history', protect, admin, getEmailHistory);
router.delete('/bulk', protect, admin, bulkDeleteTickets);
router.post('/:id/reply', protect, admin, replyToTicket);
router.delete('/:id', protect, admin, deleteTicket);
router.post('/direct-email', protect, admin, upload.single('attachment'), sendDirectEmail);

module.exports = router;

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
router.get('/order/:orderId', getOrderTickets);

// Protected user routes
router.get('/my-tickets', protect, getUserTickets);

// Admin routes (in a real app, use auth and admin middleware)
router.get('/', getTickets);
router.get('/history', getEmailHistory);
router.delete('/bulk', bulkDeleteTickets);
router.post('/:id/reply', replyToTicket);
router.delete('/:id', deleteTicket);
router.post('/direct-email', upload.single('attachment'), sendDirectEmail);

module.exports = router;

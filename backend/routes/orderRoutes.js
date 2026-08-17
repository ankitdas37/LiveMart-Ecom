const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  trackOrder,
  updateOrderDetails,
  deleteOrder,
  requestItemReturn,
  updateItemReturnStatus,
  bulkDeleteOrders,
  getOrderById,
  cancelOrderUser,
  getAllReturnRequests
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// Public: Create order (guest or logged-in), Track order by ID
router.post('/', createOrder);
router.get('/track/:id', trackOrder);

// Admin: Get all returns globally
router.get('/admin/returns/all', protect, admin, getAllReturnRequests);

// User: Get single order details (must own the order)
router.get('/:id', protect, getOrderById);

// User: Cancel an order
router.put('/:id/cancel', protect, cancelOrderUser);

// Admin only: List ALL orders, bulk delete
router.get('/', protect, admin, getOrders);
router.delete('/bulk', protect, admin, bulkDeleteOrders);

// Admin only: Update status, update details, delete a single order
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id', protect, admin, updateOrderDetails);
router.delete('/:id', protect, admin, deleteOrder);

// Return requests: user initiates, admin resolves
router.post('/:orderId/item/:itemId/return', protect, requestItemReturn);
router.put('/admin/:orderId/item/:itemId/return-status', protect, admin, updateItemReturnStatus);

module.exports = router;

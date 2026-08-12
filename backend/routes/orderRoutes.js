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
  updateItemReturnStatus 
} = require('../controllers/orderController');
router.route('/')
  .post(createOrder)
  .get(getOrders);

router.delete('/bulk', require('../controllers/orderController').bulkDeleteOrders);

router.route('/track/:id')
  .get(trackOrder);

router.route('/:id')
  .put(updateOrderDetails)
  .delete(deleteOrder);

router.route('/:id/status')
  .put(updateOrderStatus);

router.post('/:orderId/item/:itemId/return', requestItemReturn);
router.put('/admin/:orderId/item/:itemId/return-status', updateItemReturnStatus);

module.exports = router;

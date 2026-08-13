const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require('../controllers/cartController');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/sync', protect, syncCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/', protect, clearCart);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;

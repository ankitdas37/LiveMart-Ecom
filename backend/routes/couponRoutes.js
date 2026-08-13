const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  validateCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createCoupon)
  .get(protect, admin, getCoupons); // Admin gets all coupons

router.get('/active', getActiveCoupons); // Public gets active coupons, or maybe this is used on frontend for display? Usually public.

router.post('/validate', validateCoupon); // Public checks validity

router.delete('/bulk', protect, admin, bulkDeleteCoupons);

router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

module.exports = router;

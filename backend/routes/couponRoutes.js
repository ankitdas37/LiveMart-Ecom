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

router.route('/')
  .post(createCoupon)
  .get(getCoupons);

router.get('/active', getActiveCoupons);

router.post('/validate', validateCoupon);

router.delete('/bulk', bulkDeleteCoupons);

router.route('/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;

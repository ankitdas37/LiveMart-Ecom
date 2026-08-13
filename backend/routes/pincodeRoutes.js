const express = require('express');
const router = express.Router();
const {
  getPincodes,
  checkPincode,
  createPincode,
  updatePincode,
  deletePincode
} = require('../controllers/pincodeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPincodes) // Public can view pincodes (or maybe this is admin only, but usually public to see what's available)
  .post(protect, admin, createPincode);

router.route('/check/:pincode')
  .get(checkPincode); // Public to check if their pincode is serviceable

router.route('/:id')
  .put(protect, admin, updatePincode)
  .delete(protect, admin, deletePincode);

module.exports = router;

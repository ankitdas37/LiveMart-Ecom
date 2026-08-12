const express = require('express');
const router = express.Router();
const {
  getPincodes,
  checkPincode,
  createPincode,
  updatePincode,
  deletePincode
} = require('../controllers/pincodeController');

// You should normally add protect, admin middlewares here for POST/PUT/DELETE
// e.g. .post(protect, admin, createPincode)

router.route('/')
  .get(getPincodes)
  .post(createPincode);

router.route('/check/:pincode')
  .get(checkPincode);

router.route('/:id')
  .put(updatePincode)
  .delete(deletePincode);

module.exports = router;

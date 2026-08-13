const express = require('express');
const router = express.Router();
const {
  createExtraCharge,
  getExtraCharges,
  getActiveExtraCharges,
  updateExtraCharge,
  deleteExtraCharge
} = require('../controllers/extraChargeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getExtraCharges)
  .post(protect, admin, createExtraCharge);

router.get('/active', getActiveExtraCharges); // Publicly needed for checkout calculations

router.route('/:id')
  .put(protect, admin, updateExtraCharge)
  .delete(protect, admin, deleteExtraCharge);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createExtraCharge,
  getExtraCharges,
  getActiveExtraCharges,
  updateExtraCharge,
  deleteExtraCharge
} = require('../controllers/extraChargeController');

// All endpoints open for now as auth middleware is not yet strictly enforced
router.route('/')
  .post(createExtraCharge)
  .get(getExtraCharges);

router.get('/active', getActiveExtraCharges);

router.route('/:id')
  .put(updateExtraCharge)
  .delete(deleteExtraCharge);

module.exports = router;

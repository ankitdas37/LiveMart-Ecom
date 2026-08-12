const express = require('express');
const router = express.Router();
const { toggleWishlist, getUserWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, toggleWishlist)
  .get(protect, getUserWishlist);

module.exports = router;

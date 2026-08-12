const express = require('express');
const router = express.Router();
const { 
  addProductReview, 
  getReviews, 
  getAllReviewsAdmin, 
  toggleReviewStatus, 
  deleteReviewAdmin,
  updateReviewAdmin,
  createReviewAdmin,
  getUserReviews
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin Routes
router.route('/admin/all')
  .get(protect, admin, getAllReviewsAdmin);

router.route('/admin-create')
  .post(protect, admin, createReviewAdmin);

router.route('/:id/toggle-status')
  .put(protect, admin, toggleReviewStatus);

router.route('/:id')
  .put(protect, admin, updateReviewAdmin)
  .delete(protect, admin, deleteReviewAdmin);

// Public/User Routes
router.route('/my-reviews')
  .get(protect, getUserReviews);

router.route('/')
  .post(protect, addProductReview);

router.route('/:productId')
  .get(getReviews);

module.exports = router;

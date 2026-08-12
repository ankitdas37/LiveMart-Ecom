const { Review, User, Order, OrderItem, Product } = require('../models');

// @desc    Add a product review
// @route   POST /api/reviews
// @access  Private
const addProductReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  try {
    // 1. Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      where: { productId, userId: req.user.id }
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // 2. Check if user bought the product (skip if user is admin)
    if (req.user.role !== 'admin') {
      const hasBought = await Order.findOne({
        where: { userId: req.user.id },
        include: [{
          model: OrderItem,
          where: { product_id: productId }
        }]
      });

      if (!hasBought) {
        return res.status(400).json({ message: 'You must purchase this product to review it.' });
      }
    }

    const review = await Review.create({
      rating: Number(rating),
      comment,
      productId,
      userId: req.user.id,
      is_approved: true // Auto-approved by default
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId, is_approved: true },
      include: [{ model: User, attributes: ['name', 'profile_pic'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Product, attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle review approval status (Admin)
// @route   PUT /api/reviews/:id/toggle-status
// @access  Private/Admin
const toggleReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.is_approved = !review.is_approved;
    await review.save();
    
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a review (Admin)
// @route   PUT /api/reviews/:id
// @access  Private/Admin
const updateReviewAdmin = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a review manually (Admin)
// @route   POST /api/reviews/admin-create
// @access  Private/Admin
const createReviewAdmin = async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const review = await Review.create({
      rating: Number(rating),
      comment,
      productId,
      userId: req.user.id, // Auth user is admin
      is_approved: true
    });
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reviews for logged in user
// @route   GET /api/reviews/my-reviews
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, attributes: ['id', 'title', 'images'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  addProductReview,
  getReviews,
  getAllReviewsAdmin,
  toggleReviewStatus,
  deleteReviewAdmin,
  updateReviewAdmin,
  createReviewAdmin,
  getUserReviews
};

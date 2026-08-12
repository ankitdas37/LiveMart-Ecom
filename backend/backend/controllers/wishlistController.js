const { Wishlist, Product } = require('../models');

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    const existing = await Wishlist.findOne({
      where: { productId, userId: req.user.id }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ message: 'Removed from wishlist', added: false });
    } else {
      await Wishlist.create({
        productId,
        userId: req.user.id
      });
      return res.status(201).json({ message: 'Added to wishlist', added: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
      order: [['createdAt', 'DESC']]
    });
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  toggleWishlist,
  getUserWishlist
};

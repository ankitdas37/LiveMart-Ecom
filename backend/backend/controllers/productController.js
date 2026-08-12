const { Product, Category } = require('../models');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { Review } = require('../models');
    const products = await Product.findAll({
      include: [
        { model: Review, where: { is_approved: true }, required: false, attributes: ['rating'] },
        { model: Category, attributes: ['id', 'name'], required: false }
      ]
    });
    
    const productsWithRating = products.map(product => {
      const productData = product.toJSON();
      const actualReviewCount = productData.Reviews ? productData.Reviews.length : 0;
      if (actualReviewCount > 0) {
        productData.reviews_count = actualReviewCount;
        const totalRating = productData.Reviews.reduce((sum, rev) => sum + rev.rating, 0);
        productData.rating = (totalRating / actualReviewCount).toFixed(1);
      } else {
        productData.reviews_count = 0;
        productData.rating = 0;
      }
      // Attach category name for easy access
      productData.category_name = productData.Category ? productData.Category.name : null;
      delete productData.Reviews; // reduce payload size
      delete productData.Category; // avoid duplication
      return productData;
    });

    res.json(productsWithRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { Review, User } = require('../models');
    const product = await Product.findByPk(req.params.id, {
      include: [
        { 
          model: Review, 
          where: { is_approved: true }, 
          required: false,
          include: [{ model: User, attributes: ['name', 'profile_pic'] }]
        },
        { model: Category, attributes: ['id', 'name'], required: false }
      ]
    });
    
    if (product) {
      // Calculate rating and count
      const productData = product.toJSON();
      const actualReviewCount = productData.Reviews ? productData.Reviews.length : 0;
      
      if (actualReviewCount > 0) {
        productData.reviews_count = actualReviewCount;
        const totalRating = productData.Reviews.reduce((sum, rev) => sum + rev.rating, 0);
        productData.rating = (totalRating / actualReviewCount).toFixed(1);
      } else {
        productData.reviews_count = 0;
        productData.rating = 0;
      }
      // Attach category name for easy access
      productData.category_name = productData.Category ? productData.Category.name : null;

      res.json(productData);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { is_featured: true } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { is_new_arrival: true } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    await product.destroy();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct
};

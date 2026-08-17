const { Product, Category } = require('../models');
const { cache, clearProductCache } = require('../utils/cache');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const cacheKey = 'products_all';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

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

    cache.set(cacheKey, productsWithRating);
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
    const cacheKey = 'products_featured';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const products = await Product.findAll({ where: { is_featured: true } });
    cache.set(cacheKey, products);
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
    const cacheKey = 'products_new_arrivals';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const products = await Product.findAll({ where: { is_new_arrival: true } });
    cache.set(cacheKey, products);
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
    const data = { ...req.body };
    // Strip empty-string image URLs that come from unfilled admin form fields
    if (Array.isArray(data.images)) {
      data.images = data.images.filter(url => url && url.trim() !== '');
    }
    const product = await Product.create(data);
    clearProductCache();
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

    const data = { ...req.body };
    // Strip empty-string image URLs that come from unfilled admin form fields
    if (Array.isArray(data.images)) {
      data.images = data.images.filter(url => url && url.trim() !== '');
    }

    await product.update(data);
    clearProductCache();
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
    clearProductCache();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete this product because it is linked to existing data (e.g., orders, reviews).' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk
// @access  Private/Admin
const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided' });
    }

    const products = await Product.findAll({ where: { id: ids } });
    const cloudinary = require('../config/cloudinary');

    // Delete all product images from Cloudinary in parallel
    const deletePromises = [];
    products.forEach((product) => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((imageUrl) => {
          if (typeof imageUrl === 'string' && imageUrl.includes('cloudinary.com')) {
            try {
              const urlParts = imageUrl.split('/');
              const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
              const publicId = folderAndFile.split('.')[0];
              if (publicId) {
                deletePromises.push(cloudinary.uploader.destroy(publicId));
              }
            } catch (error) {
              console.error(`Failed to queue Cloudinary image deletion:`, error);
            }
          }
        });
      }
    });
    
    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    await Product.destroy({ where: { id: ids } });
    clearProductCache();
    res.json({ message: `${ids.length} product(s) removed successfully` });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete selected products because they are linked to existing data (e.g., orders, reviews).' });
    }
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
  deleteProduct,
  bulkDeleteProducts
};

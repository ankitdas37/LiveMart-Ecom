const { Category } = require('../models');
const { cache, clearCategoryCache } = require('../utils/cache');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const cacheKey = 'categories_all';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const categories = await Category.findAll();
    cache.set(cacheKey, categories);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    const category = await Category.create({ name, description, image_url });
    clearCategoryCache();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.update(req.body);
    clearCategoryCache();
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.destroy();
    clearCategoryCache();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete this category because it contains existing products. Please remove them first.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk delete categories
// @route   DELETE /api/categories/bulk
// @access  Private/Admin
const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No category IDs provided' });
    }

    const categories = await Category.findAll({ where: { id: ids } });
    const cloudinary = require('../config/cloudinary');

    // Delete all category images from Cloudinary in parallel
    const deletePromises = [];
    categories.forEach((category) => {
      if (category.image_url && category.image_url.includes('cloudinary.com')) {
        try {
          const urlParts = category.image_url.split('/');
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
    
    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    await Category.destroy({ where: { id: ids } });
    clearCategoryCache();
    res.json({ message: `${ids.length} category(ies) removed successfully` });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete selected categories because they contain existing products. Please remove them first.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories
};


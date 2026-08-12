const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories
} = require('../controllers/categoryController');

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.delete('/bulk', bulkDeleteCategories);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;

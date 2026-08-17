const NodeCache = require('node-cache');

// Standard TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Clear specific keys related to products
const clearProductCache = () => {
  const keys = cache.keys();
  const productKeys = keys.filter(key => key.includes('products') || key.includes('product'));
  if (productKeys.length > 0) {
    cache.del(productKeys);
  }
};

// Clear specific keys related to categories
const clearCategoryCache = () => {
  const keys = cache.keys();
  const categoryKeys = keys.filter(key => key.includes('categories') || key.includes('category'));
  if (categoryKeys.length > 0) {
    cache.del(categoryKeys);
  }
};

module.exports = {
  cache,
  clearProductCache,
  clearCategoryCache
};

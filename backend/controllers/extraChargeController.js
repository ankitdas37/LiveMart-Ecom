const { ExtraCharge, Product } = require('../models');

const applyChargeToProducts = async (chargeId, targetProducts = [], targetCategories = []) => {
  let productIds = new Set(targetProducts.map(id => Number(id)));
  
  if (targetCategories && targetCategories.length > 0) {
    const categoryProducts = await Product.findAll({
      where: { categoryId: targetCategories }
    });
    categoryProducts.forEach(p => productIds.add(p.id));
  }
  
  const uniqueProductIds = Array.from(productIds);
  if (uniqueProductIds.length === 0) return;
  
  const productsToUpdate = await Product.findAll({
    where: { id: uniqueProductIds }
  });
  
  for (const product of productsToUpdate) {
    let currentCharges = product.extra_charges;
    if (typeof currentCharges === 'string') {
      try { currentCharges = JSON.parse(currentCharges); } catch(e) { currentCharges = []; }
    }
    currentCharges = currentCharges || [];
    
    if (!currentCharges.includes(chargeId)) {
      currentCharges.push(chargeId);
      product.extra_charges = currentCharges;
      await product.save();
    }
  }
};


// @desc    Create new extra charge
// @route   POST /api/extracharges
// @access  Private/Admin
const createExtraCharge = async (req, res) => {
  try {
    const { name, description, price, isActive, targetProducts, targetCategories } = req.body;
    
    const existing = await ExtraCharge.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Extra charge with this name already exists' });
    }

    const extraCharge = await ExtraCharge.create({
      name,
      description,
      price,
      isActive: isActive !== undefined ? isActive : true
    });

    if ((targetProducts && targetProducts.length > 0) || (targetCategories && targetCategories.length > 0)) {
      await applyChargeToProducts(extraCharge.id, targetProducts || [], targetCategories || []);
    }

    res.status(201).json(extraCharge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all extra charges
// @route   GET /api/extracharges
// @access  Private/Admin
const getExtraCharges = async (req, res) => {
  try {
    const charges = await ExtraCharge.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(charges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get active extra charges
// @route   GET /api/extracharges/active
// @access  Public
const getActiveExtraCharges = async (req, res) => {
  try {
    const charges = await ExtraCharge.findAll({
      where: { isActive: true }
    });
    res.json(charges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update extra charge
// @route   PUT /api/extracharges/:id
// @access  Private/Admin
const updateExtraCharge = async (req, res) => {
  try {
    const charge = await ExtraCharge.findByPk(req.params.id);
    if (!charge) return res.status(404).json({ message: 'Extra charge not found' });

    const { name, description, price, isActive, targetProducts, targetCategories } = req.body;

    if (name) {
      const existing = await ExtraCharge.findOne({ where: { name } });
      if (existing && existing.id !== charge.id) {
        return res.status(400).json({ message: 'Extra charge with this name already exists' });
      }
      charge.name = name;
    }

    if (description !== undefined) charge.description = description;
    if (price !== undefined) charge.price = price;
    if (isActive !== undefined) charge.isActive = isActive;

    await charge.save();

    if ((targetProducts && targetProducts.length > 0) || (targetCategories && targetCategories.length > 0)) {
      await applyChargeToProducts(charge.id, targetProducts || [], targetCategories || []);
    }

    res.json(charge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete extra charge
// @route   DELETE /api/extracharges/:id
// @access  Private/Admin
const deleteExtraCharge = async (req, res) => {
  try {
    const charge = await ExtraCharge.findByPk(req.params.id);
    if (!charge) return res.status(404).json({ message: 'Extra charge not found' });

    await charge.destroy();
    res.json({ message: 'Extra charge removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createExtraCharge,
  getExtraCharges,
  getActiveExtraCharges,
  updateExtraCharge,
  deleteExtraCharge
};

const { Coupon } = require('../models');
const { Op } = require('sequelize');

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Public (in real app, Admin)
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartValue, description, expiryDate, isActive, usageLimit, isVisible } = req.body;
    
    // Check if code already exists
    const existing = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minCartValue: minCartValue || 0,
      description: description || null,
      expiryDate,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      isActive: isActive !== undefined ? isActive : true,
      isVisible: isVisible !== undefined ? isVisible : false
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public (in real app, Admin)
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get active coupons (for frontend)
// @route   GET /api/coupons/active
// @access  Public
const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        isVisible: true,
        expiryDate: {
          [Op.gt]: new Date()
        }
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Public (in real app, Admin)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (coupon) {
      await coupon.destroy();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk delete coupons
// @route   DELETE /api/coupons/bulk
// @access  Public (in real app, Admin)
const bulkDeleteCoupons = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No coupon IDs provided' });
    }

    await Coupon.destroy({ where: { id: ids } });
    res.json({ message: `${ids.length} coupon(s) removed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Public (in real app, Admin)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const { code, discountType, discountValue, minCartValue, description, expiryDate, isActive, usageLimit, isVisible } = req.body;

    if (code) {
      const existing = await Coupon.findOne({ where: { code: code.toUpperCase() } });
      if (existing && existing.id !== coupon.id) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      coupon.code = code.toUpperCase();
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue) coupon.discountValue = discountValue;
    if (minCartValue !== undefined) coupon.minCartValue = minCartValue;
    if (description !== undefined) coupon.description = description;
    if (expiryDate) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (isVisible !== undefined) coupon.isVisible = isVisible;
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    }

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code, cartValue } = req.body;

    const coupon = await Coupon.findOne({ 
      where: { code: code.toUpperCase() } 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its maximum usage limit' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (parseFloat(cartValue) < parseFloat(coupon.minCartValue)) {
      return res.status(400).json({ message: `Minimum cart value of ₹${coupon.minCartValue} required` });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'FIXED') {
      discountAmount = parseFloat(coupon.discountValue);
    } else if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (parseFloat(cartValue) * parseFloat(coupon.discountValue)) / 100;
    }

    // Prevent discount from being more than cart value
    if (discountAmount > cartValue) {
      discountAmount = cartValue;
    }

    res.json({ 
      valid: true, 
      coupon, 
      discountAmount: discountAmount.toFixed(2) 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  validateCoupon
};

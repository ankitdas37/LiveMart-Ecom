const { Pincode } = require('../models');

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Public
const getPincodes = async (req, res) => {
  try {
    const pincodes = await Pincode.findAll();
    res.json(pincodes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pincodes', error: error.message });
  }
};

// @desc    Check a specific pincode for delivery availability
// @route   GET /api/pincodes/check/:pincode
// @access  Public
const checkPincode = async (req, res) => {
  try {
    const pincodeValue = req.params.pincode;
    const pincodeRecord = await Pincode.findOne({ where: { pincode: pincodeValue } });

    if (!pincodeRecord) {
      return res.status(404).json({ serviceable: false, message: 'Sorry, we do not deliver to this pincode.' });
    }

    if (!pincodeRecord.is_active) {
      return res.status(400).json({ serviceable: false, message: 'Delivery to this pincode is currently inactive.' });
    }

    res.json({ serviceable: true, details: pincodeRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking pincode', error: error.message });
  }
};

// @desc    Create a pincode
// @route   POST /api/pincodes
// @access  Private/Admin
const createPincode = async (req, res) => {
  try {
    const { pincode, area_name, city, state, delivery_charge, estimated_days, is_active } = req.body;
    
    // Check if exists
    const exists = await Pincode.findOne({ where: { pincode } });
    if (exists) {
      return res.status(400).json({ message: 'Pincode already exists' });
    }

    const newPincode = await Pincode.create({
      pincode,
      area_name,
      city,
      state,
      delivery_charge,
      estimated_days,
      is_active
    });

    res.status(201).json(newPincode);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating pincode', error: error.message });
  }
};

// @desc    Update a pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
const updatePincode = async (req, res) => {
  try {
    const { pincode, area_name, city, state, delivery_charge, estimated_days, is_active } = req.body;
    
    const pincodeRecord = await Pincode.findByPk(req.params.id);
    if (!pincodeRecord) {
      return res.status(404).json({ message: 'Pincode not found' });
    }

    pincodeRecord.pincode = pincode || pincodeRecord.pincode;
    pincodeRecord.area_name = area_name || pincodeRecord.area_name;
    pincodeRecord.city = city || pincodeRecord.city;
    pincodeRecord.state = state || pincodeRecord.state;
    pincodeRecord.delivery_charge = delivery_charge !== undefined ? delivery_charge : pincodeRecord.delivery_charge;
    pincodeRecord.estimated_days = estimated_days !== undefined ? estimated_days : pincodeRecord.estimated_days;
    pincodeRecord.is_active = is_active !== undefined ? is_active : pincodeRecord.is_active;

    await pincodeRecord.save();
    res.json(pincodeRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating pincode', error: error.message });
  }
};

// @desc    Delete a pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
const deletePincode = async (req, res) => {
  try {
    const pincodeRecord = await Pincode.findByPk(req.params.id);
    if (!pincodeRecord) {
      return res.status(404).json({ message: 'Pincode not found' });
    }

    await pincodeRecord.destroy();
    res.json({ message: 'Pincode deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting pincode', error: error.message });
  }
};

module.exports = {
  getPincodes,
  checkPincode,
  createPincode,
  updatePincode,
  deletePincode
};

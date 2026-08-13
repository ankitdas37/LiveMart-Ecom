const { Address, User } = require('../models');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    let { fullName, email, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng } = req.body;

    if (is_default) {
      await Address.update({ is_default: false }, { where: { userId: req.user.id } });
    }

    // Convert empty string locations to null to prevent DECIMAL casting errors
    location_lat = location_lat || null;
    location_lng = location_lng || null;

    const address = await Address.create({
      fullName, email, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng, userId: req.user.id
    });

    res.status(201).json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const query = { id: req.params.id };
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }
    const address = await Address.findOne({ where: query });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    let { fullName, email, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng } = req.body;

    if (is_default) {
      await Address.update({ is_default: false }, { where: { userId: address.userId } });
    }

    // Convert empty string locations to null to prevent DECIMAL casting errors
    location_lat = location_lat || null;
    location_lng = location_lng || null;

    await address.update({
      fullName, email, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng
    });

    res.json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const query = { id: req.params.id };
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }
    const address = await Address.findOne({ where: query });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.destroy();
    res.json({ message: 'Address removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

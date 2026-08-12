const { Address, User } = require('../models');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { UserId: req.user.id } });
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
    const { fullName, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng } = req.body;

    if (is_default) {
      await Address.update({ is_default: false }, { where: { UserId: req.user.id } });
    }

    const address = await Address.create({
      fullName, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng, UserId: req.user.id
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
      query.UserId = req.user.id;
    }
    const address = await Address.findOne({ where: query });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const { fullName, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng } = req.body;

    if (is_default) {
      await Address.update({ is_default: false }, { where: { UserId: address.UserId } });
    }

    await address.update({
      fullName, phone, altPhone, street, landmark, policeStation, city, district, state, country, pincode, is_default, addressType, location_lat, location_lng
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
      query.UserId = req.user.id;
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

const { Setting } = require('../models');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.findAll();
    
    // Convert array to object { KEY: value }
    const settings = {};
    settingsList.forEach(setting => {
      let value = setting.value;
      if (setting.type === 'NUMBER') value = parseFloat(value);
      if (setting.type === 'BOOLEAN') value = value === 'true';
      settings[setting.key] = value;
    });

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update settings (multiple)
// @route   PUT /api/settings
// @access  Public (in real app, Admin)
const updateSettings = async (req, res) => {
  try {
    const settingsToUpdate = req.body; // Expecting an array of objects [{ key, value, type }]

    for (const item of settingsToUpdate) {
      await Setting.upsert({
        key: item.key,
        value: String(item.value),
        type: item.type || 'STRING'
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const seedSettings = async () => {
  try {
    const count = await Setting.count();
    if (count === 0) {
      await Setting.bulkCreate([
        { key: 'SHIPPING_CHARGE', value: '40', type: 'NUMBER' },
        { key: 'PAYMENT_UPI_ID', value: 'merchant@upi', type: 'STRING' },
        { key: 'PAYMENT_QR_CODE', value: '', type: 'STRING' },
        { key: 'PAYMENT_COD_ENABLED', value: 'true', type: 'BOOLEAN' },
        { key: 'PAYMENT_ONLINE_ENABLED', value: 'true', type: 'BOOLEAN' }
      ]);
      console.log('Default settings seeded');
    }
  } catch (error) {
    console.error('Failed to seed settings', error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  seedSettings
};

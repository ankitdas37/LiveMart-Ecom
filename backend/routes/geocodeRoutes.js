const express = require('express');
const router = express.Router();
const https = require('https');

// @desc    Reverse geocode lat/lng via Nominatim (server-side proxy to avoid browser CORS block)
// @route   GET /api/geocode/reverse?lat=X&lng=Y
// @access  Public
router.get('/reverse', (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng are required' });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  const options = {
    headers: {
      'User-Agent': 'EComApp/1.0 (contact@ecomapp.local)',
      'Accept-Language': 'en',
    },
  };

  https.get(url, options, (apiRes) => {
    let raw = '';
    apiRes.on('data', chunk => (raw += chunk));
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(raw);
        res.json(parsed);
      } catch (e) {
        res.status(500).json({ message: 'Failed to parse geocoding response' });
      }
    });
  }).on('error', (err) => {
    console.error('Geocoding error:', err.message);
    res.status(500).json({ message: 'Geocoding request failed' });
  });
});

module.exports = router;

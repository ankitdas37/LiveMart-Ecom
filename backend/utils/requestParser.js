const UAParser = require('ua-parser-js');
const axios = require('axios');

exports.parseRequestData = async (req) => {
  // Get IP
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0];
  }
  // Convert IPv6 localhost to IPv4
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Get UA info
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();

  let device_type = 'Desktop';
  if (result.device.vendor && result.device.model) {
    device_type = `${result.device.vendor} ${result.device.model}`;
  } else if (result.device.type) {
    device_type = result.device.type;
    device_type = device_type.charAt(0).toUpperCase() + device_type.slice(1);
  }
  const os = result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : 'Unknown OS';
  const browser = result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : 'Unknown Browser';

  // Get Location
  let location = 'Local Network';
  if (ip !== '127.0.0.1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      if (response.data && response.data.status === 'success') {
        location = `${response.data.city}, ${response.data.country}`;
      } else {
        location = 'Unknown';
      }
    } catch (error) {
      console.error('Failed to get location from IP', error.message);
      location = 'Unknown';
    }
  }

  return { ip, ip_address: ip, device_type, os, browser, location };
};

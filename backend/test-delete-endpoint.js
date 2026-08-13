const axios = require('axios');

const run = async () => {
  try {
    const res = await axios.delete('http://localhost:5000/api/orders/20');
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
};

run();

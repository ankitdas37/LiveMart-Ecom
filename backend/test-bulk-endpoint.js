const axios = require('axios');

const run = async () => {
  try {
    const res = await axios.delete('http://localhost:5000/api/orders/bulk', {
      data: { ids: [1] } // Assuming order 1 exists or doesn't, just to see the response
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
};

run();

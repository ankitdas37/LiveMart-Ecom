const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/orders/track/LIVEMART000024');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

test();

const axios = require('axios');

async function test() {
  try {
    // 1. Register a user
    const email = `test${Date.now()}@test.com`;
    console.log('Registering', email);
    const authRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: email,
      password: 'password123',
      otp: '123456' // assuming dummy OTP works or just use login if you already have one
    }).catch(e => {
      // maybe OTP is required and validated. Let's just create a user directly in DB
      return null;
    });

    let token = authRes ? authRes.data.token : null;

    if (!token) {
      // Let's create user directly via DB to bypass OTP
      const { User } = require('./models');
      const user = await User.create({
        name: 'Test',
        email: email,
        password: 'password123'
      });
      const jwt = require('jsonwebtoken');
      token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback', { expiresIn: '30d' });
    }

    console.log('Token:', token);

    // 2. Add to cart
    console.log('Adding to cart...');
    const addRes = await axios.post('http://localhost:5000/api/cart', {
      productId: 1, // assume product 1 exists
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Add Result:', addRes.data);

    // 3. Get cart
    console.log('Getting cart...');
    const getRes = await axios.get('http://localhost:5000/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Get Result:', getRes.data);

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();

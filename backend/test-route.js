const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'your_jwt_secret');

axios.get('http://localhost:5000/api/orders/admin/returns/all', { 
  headers: { Authorization: `Bearer ${token}` } 
})
.then(res => console.log('Success:', res.data))
.catch(err => console.error('Error:', err.response ? err.response.data : err.message));

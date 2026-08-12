const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const couponRoutes = require('./routes/couponRoutes');
const settingRoutes = require('./routes/settingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const extraChargeRoutes = require('./routes/extraChargeRoutes');
const adminNoteRoutes = require('./routes/adminNoteRoutes');
const supportRoutes = require('./routes/supportRoutes');
const { seedSettings } = require('./controllers/settingController');

dotenv.config();

const app = express(); // nodemon restart trigger
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pincodes', require('./routes/pincodeRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/extracharges', extraChargeRoutes);
app.use('/api/admin-notes', adminNoteRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/geocode', require('./routes/geocodeRoutes'));

// Database Sync and Server Start
const startServer = async () => {
  try {
    await connectDB();
    // Sync models - alter:true disabled to prevent ENUM crash; columns added via migration script
    await sequelize.sync();
    console.log('Database connected');
    
    // Check Cloudinary connection
    const cloudinary = require('./config/cloudinary');
    try {
      await cloudinary.api.ping();
      console.log('Cloudinary connected successfully.');
    } catch (err) {
      console.log('Cloudinary connection failed:', err.message);
    }
    
    // Seed settings
    await seedSettings();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

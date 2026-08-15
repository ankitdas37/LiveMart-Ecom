const { User, Order, OTP, Address, Session, LoginActivity, Wishlist, Review, SupportTicket, Product } = require('../models');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetPasswordOTP'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordOTP'] }
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.profile_pic !== undefined) {
        user.profile_pic = req.body.profile_pic;
      }
      const isPasswordChanged = !!req.body.password;
      const isPhoneChanged = req.body.phone !== undefined && req.body.phone !== (user.phone || '');
      const isEmailChanged = req.body.email && req.body.email !== user.email;

      // Email, password, and phone are all sensitive — require OTP verification for any of them
      if (isPasswordChanged || isPhoneChanged || isEmailChanged) {
        if (!req.body.otp) {
          return res.status(400).json({ message: 'OTP is required to update sensitive information' });
        }
        const otpRecord = await OTP.findOne({ where: { email: user.email, otp: req.body.otp } });
        if (!otpRecord) {
          return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (otpRecord.expiresAt < new Date()) {
          return res.status(400).json({ message: 'OTP expired' });
        }
        
        if (isPhoneChanged) {
          user.phone = req.body.phone;
        }

        if (isEmailChanged) {
          const emailExists = await User.findOne({ where: { email: req.body.email } });
          if (emailExists) {
            return res.status(400).json({ message: 'Email is already in use' });
          }
          user.email = req.body.email;
        }

        if (isPasswordChanged) {
          user.password = req.body.password;
          
          // Send confirmation email only for password changes
          try {
            const htmlBody = `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
              <h1 style="color: #f59e0b;">Password Changed Successfully! 🎉</h1>
              <p>Hi ${user.name},</p>
              <p>Your password for W!FO MART was just updated. If you did this, you're all set!</p>
              <p>If you didn't make this change, please contact support immediately.</p>
              <p>Stay safe, <br> The W!FO MART Team ✨</p>
            </div>`;
            await sendEmail({
              email: user.email,
              subject: 'W!FO MART - Password Changed Successfully',
              message: 'Your password was changed successfully.',
              html: htmlBody
            });
          } catch (error) {
            console.error('Failed to send password change confirmation email:', error);
          }
        }
        
        await OTP.destroy({ where: { email: user.email } }); // Clear OTP after successful use
      }
      


      await user.save();
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_pic: user.profile_pic,
        token: req.headers.authorization.split(' ')[1] // keep existing token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      if (req.body.profile_pic !== undefined) user.profile_pic = req.body.profile_pic;
      if (req.body.password) user.password = req.body.password; // will be hashed by hook

      await user.save();
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_pic: user.profile_pic,
        googleId: user.googleId,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      // Don't allow admin to delete themselves
      if (user.id === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own admin account' });
      }

      // Delete profile picture from Cloudinary if it exists
      if (user.profile_pic && user.profile_pic.includes('cloudinary.com')) {
        try {
          const cloudinary = require('../config/cloudinary');
          // Extract public_id from URL: e.g. https://res.cloudinary.com/.../ecommerce/filename.jpg -> ecommerce/filename
          const urlParts = user.profile_pic.split('/');
          const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
          const publicId = folderAndFile.split('.')[0]; // remove extension
          
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          // Profile image removed from Cloudinary
          }
        } catch (cloudinaryError) {
          console.error('Failed to delete image from Cloudinary:', cloudinaryError);
          // Proceed with user deletion even if image deletion fails
        }
      }

      await user.destroy();
      res.json({ message: 'User and associated data removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete this user because they are linked to existing data (e.g., orders, reviews).' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk delete users
// @route   DELETE /api/users/bulk
// @access  Private/Admin
const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No user IDs provided' });
    }

    // Filter out the current admin's ID so they don't delete themselves
    const idsToDelete = ids.filter(id => id !== req.user.id);
    
    if (idsToDelete.length === 0) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Find users to get their profile pictures
    const users = await User.findAll({ where: { id: idsToDelete } });
    const cloudinary = require('../config/cloudinary');

    // Delete profile pictures from Cloudinary in parallel
    const deletePromises = users.map(async (user) => {
      if (user.profile_pic && user.profile_pic.includes('cloudinary.com')) {
        try {
          const urlParts = user.profile_pic.split('/');
          const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
          const publicId = folderAndFile.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (error) {
          console.error(`Failed to delete Cloudinary image for user ${user.id}:`, error);
        }
      }
    });
    await Promise.allSettled(deletePromises);

    // Delete users from DB
    await User.destroy({ where: { id: idsToDelete } });
    
    res.json({ message: `${idsToDelete.length} user(s) removed successfully` });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete selected users because they are linked to existing data (e.g., orders, reviews).' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's orders (by self)
// @route   GET /api/users/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const { OrderItem, Product } = require('../models');
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a specific user's orders (Admin only)
// @route   GET /api/users/:id/orders
// @access  Private/Admin
const getOrdersByUserId = async (req, res) => {
  try {
    const { OrderItem, Product } = require('../models');
    const orders = await Order.findAll({
      where: { userId: req.params.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isVerified: true
    });

    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'resetPasswordOTP'] }
    });

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send OTP for password change in profile
// @route   POST /api/users/send-password-otp
// @access  Private
const sendPasswordChangeOTP = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reason = req.body.reason || 'password';
    const isPhoneUpdate = reason === 'phone';

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTP.destroy({ where: { email: user.email } });
    await OTP.create({ email: user.email, otp: otpCode, expiresAt });

    // OTP sent via email. Removed console.log to prevent OTP exposure in logs.

    const title = isPhoneUpdate ? 'Profile Update Request' : 'Password Change Request';
    const actionText = isPhoneUpdate ? 'update your profile' : 'change your password';
    const subjectLine = isPhoneUpdate ? 'W!FO MART - Profile Update OTP' : 'W!FO MART - Password Change OTP';

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h1 style="color: #f59e0b;">${title}</h1>
      <p>Hi ${user.name},</p>
      <p>Use the following OTP to ${actionText}:</p>
      <h2 style="letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; display: inline-block; border-radius: 5px;">${otpCode}</h2>
      <p>This code expires in 10 minutes. If you didn't request this, safely ignore this email.</p>
    </div>`;

    try {
      await sendEmail({
        email: user.email,
        subject: subjectLine,
        message: `Your OTP is: ${otpCode}`,
        html: htmlBody,
      });
      res.status(200).json({ message: 'OTP sent to your email' });
    } catch (emailError) {
      console.error('Email failed:', emailError);
      res.status(200).json({ message: 'OTP generated. Check console if email failed.' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get comprehensive user details for admin
// @route   GET /api/users/:id/details
// @access  Private/Admin
const getAdminUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'resetPasswordOTP'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all related data in parallel
    const [addresses, sessions, loginActivities, wishlist, reviews, tickets, orders] = await Promise.all([
      Address.findAll({ where: { userId: userId }, order: [['is_default', 'DESC']] }),
      Session.findAll({ where: { userEmail: user.email }, order: [['last_active', 'DESC']] }),
      LoginActivity.findAll({ where: { email: user.email }, order: [['createdAt', 'DESC']] }),
      Wishlist.findAll({ where: { userId }, include: [{ model: Product }], order: [['createdAt', 'DESC']] }),
      Review.findAll({ where: { userId }, include: [{ model: Product }], order: [['createdAt', 'DESC']] }),
      SupportTicket.findAll({ where: { email: user.email }, order: [['createdAt', 'DESC']] }),
      Order.findAll({ where: { userId }, order: [['createdAt', 'DESC']] })
    ]);

    res.json({
      user,
      addresses,
      sessions,
      loginActivities,
      wishlist,
      reviews,
      tickets,
      orders
    });
  } catch (error) {
    console.error('Failed to get admin user details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send OTP for admin action verification
// @route   POST /api/users/admin/send-action-otp
// @access  Private/Admin
const sendAdminActionOTP = async (req, res) => {
  try {
    const user = req.user;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTP.destroy({ where: { email: user.email } });
    await OTP.create({ email: user.email, otp: otpCode, expiresAt });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Admin Action Verification</h2>
        <p>You have requested to perform a highly sensitive administrative action on W!FO MART.</p>
        <p>Your verification code is: <b style="font-size: 24px; color: #d97706;">${otpCode}</b></p>
        <p>This code expires in 10 minutes. If you did not request this, please secure your account immediately.</p>
      </div>
    `;

    // OTP sent via email. Removed console.log to prevent OTP exposure in server logs.

    try {
      await sendEmail({
        email: user.email,
        subject: 'W!FO MART - Admin Action Verification Code',
        html
      });
      res.json({ message: 'OTP sent to your admin email' });
    } catch (emailError) {
      console.error('Admin OTP Email failed:', emailError);
      res.status(200).json({ message: 'OTP generated. Check console if email failed.' });
    }
  } catch (error) {
    console.error(error);
    console.error('Send Admin OTP error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// @desc    Verify admin action via password or OTP
// @route   POST /api/users/admin/verify-action
// @access  Private/Admin
const verifyAdminAction = async (req, res) => {
  try {
    const { method, password, otp } = req.body;
    const user = req.user;

    if (method === 'password') {
      const fullUser = await User.findByPk(user.id); // Fetch full user to get password hash
      const isMatch = await bcrypt.compare(password, fullUser.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin password' });
      }
      return res.json({ message: 'Verified' });
    } 
    
    if (method === 'otp') {
      const record = await OTP.findOne({ where: { email: user.email } });
      if (!record || record.otp !== otp || new Date() > record.expiresAt) {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
      }
      await OTP.destroy({ where: { email: user.email } });
      return res.json({ message: 'Verified' });
    }

    res.status(400).json({ message: 'Invalid verification method' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// @desc    Delete own account (self-service data erasure)
// @route   DELETE /api/users/me
// @access  Private
const deleteOwnAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete profile picture from Cloudinary if it exists
    if (user.profile_pic && user.profile_pic.includes('cloudinary.com')) {
      try {
        const cloudinary = require('../config/cloudinary');
        const urlParts = user.profile_pic.split('/');
        const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
        const publicId = folderAndFile.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error('Failed to delete profile pic from Cloudinary during account deletion');
      }
    }

    // Anonymize linked orders (preserve business records but strip PII)
    await Order.update(
      {
        customer_name: '[Deleted User]',
        customer_email: 'deleted@livemart.com',
        customer_phone: '0000000000',
        customer_address: '[REDACTED]',
      },
      { where: { userId: user.id } }
    );

    // Delete all PII-containing associated records
    await Address.destroy({ where: { userId: user.id } });

    // Destroy the user record itself
    await user.destroy();

    res.json({ message: 'Your account and personal data have been permanently deleted.' });
  } catch (error) {
    console.error('Account deletion error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserOrders,
  createUser,
  getOrdersByUserId,
  sendPasswordChangeOTP,
  getAdminUserDetails,
  sendAdminActionOTP,
  verifyAdminAction,
  deleteOwnAccount
};

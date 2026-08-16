const express = require('express');
const router = express.Router();
const {
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
  deleteOwnAccount,
  forceLogoutUser
} = require('../controllers/userController');

const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

const {
  getSessions,
  revokeSession,
  revokeAllOtherSessions,
  getLoginActivity,
  deleteLoginActivity,
  clearAllLoginActivity,
  logoutAll
} = require('../controllers/sessionController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Self-service account deletion (GDPR right to erasure)
router.delete('/me', protect, deleteOwnAccount);

router.post('/send-password-otp', protect, sendPasswordChangeOTP);

// Admin Action Verification
router.post('/admin/send-action-otp', protect, admin, sendAdminActionOTP);
router.post('/admin/verify-action', protect, admin, verifyAdminAction);

// Address Routes
router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/orders')
  .get(protect, getUserOrders);

router.route('/:id/orders')
  .get(protect, admin, getOrdersByUserId);

// Session & Login Activity Routes
router.get('/sessions', protect, getSessions);
router.delete('/sessions', protect, revokeAllOtherSessions);
router.delete('/sessions/:id', protect, revokeSession);
router.get('/login-activity', protect, getLoginActivity);
router.delete('/login-activity', protect, clearAllLoginActivity);
router.delete('/login-activity/:id', protect, deleteLoginActivity);
router.post('/logout', protect, logoutAll);

router.delete('/bulk', protect, admin, bulkDeleteUsers);

router.get('/:id/details', protect, admin, getAdminUserDetails);
router.post('/:id/force-logout', protect, admin, forceLogoutUser);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;

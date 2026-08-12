const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, googleAuth, sendSignupOTP, revokeDevice } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/send-otp', sendSignupOTP);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/revoke-device/:sessionId', revokeDevice);

module.exports = router;

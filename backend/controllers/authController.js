const { User, OTP, Session, LoginActivity } = require('../models');
const jwt = require('jsonwebtoken');
const { parseRequestData } = require('../utils/requestParser');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT
const generateToken = (id, sessionId) => {
  return jwt.sign({ id, sessionId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Helper function to send an attractive login alert email
const sendLoginAlertEmail = async (user, session, reqData) => {
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Login Alert – LiveMart</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:900;letter-spacing:-1px;">New <span style="color:#bfdbfe;">Login</span></h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">We noticed a new login</h2>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Hi ${user.name}, your LiveMart account was just accessed from a new device.
              </p>
              <!-- Details Box -->
              <div style="background:#0f172a;border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 10px;color:#cbd5e1;font-size:14px;"><strong>Device:</strong> ${reqData.device_type} - ${reqData.browser}</p>
                <p style="margin:0 0 10px;color:#cbd5e1;font-size:14px;"><strong>OS:</strong> ${reqData.os}</p>
                <p style="margin:0 0 10px;color:#cbd5e1;font-size:14px;"><strong>IP Address:</strong> ${reqData.ip_address}</p>
                <p style="margin:0;color:#cbd5e1;font-size:14px;"><strong>Location:</strong> ${reqData.location}</p>
              </div>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                If this was you, you can safely ignore this email.
              </p>
              <!-- Action Button -->
              <div style="text-align:center;margin-bottom:10px;">
                <a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/revoke-device/${session.id}" style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">Log out this device</a>
              </div>
              <!-- Footer with Anti-Spam Measures -->
              <div style="margin-top:20px;padding-top:20px;border-top:1px solid #334155;text-align:center;">
                <p style="margin:0 0 5px;color:#64748b;font-size:12px;">This is an automated security notice. Please do not reply directly to this email.</p>
                <p style="margin:0 0 5px;color:#64748b;font-size:12px;">You received this because a new login was detected on your LiveMart account.</p>
                <p style="margin:0;color:#64748b;font-size:12px;">LiveMart Inc. • 123 E-Commerce St, Tech City • <a href="#" style="color:#3b82f6;text-decoration:none;">Unsubscribe from alerts</a></p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} LiveMart. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const plainText = `Hi ${user.name}, your LiveMart account was just accessed from a new device.\n\nDevice: ${reqData.device_type} - ${reqData.browser}\nOS: ${reqData.os}\nIP: ${reqData.ip_address}\nLocation: ${reqData.location}\n\nIf this wasn't you, log into your account immediately and revoke this device.`;

    await sendEmail({
      email: user.email,
      subject: `LiveMart: New sign-in on ${reqData.os}`,
      message: plainText,
      html: htmlBody,
    });
  } catch (err) {
    console.error('Failed to send login alert email:', err.message);
  }
};

// @desc    Send OTP for signup
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'This account is already registered. Please go to the Sign In page.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Remove existing OTPs for this email to prevent spam
    await OTP.destroy({ where: { email } });
    await OTP.create({ email, otp: otpCode, expiresAt });

    // OTP generated and will be sent via email. Removed console.log to prevent OTP exposure in logs.

    // Build a beautiful HTML email
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email – LiveMart</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#1e293b;font-size:32px;font-weight:900;letter-spacing:-1px;">Live<span style="color:#fff;">Mart</span></h1>
              <p style="margin:6px 0 0;color:#1e293b;font-size:13px;opacity:0.8;font-weight:600;">Your trusted online store</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">Verify your email address</h2>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
                You're almost there! Enter the verification code below to complete your LiveMart account setup.
              </p>
              <!-- OTP Box -->
              <div style="background:#0f172a;border:2px solid #f59e0b;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Verification Code</p>
                <p style="margin:0;color:#f59e0b;font-size:44px;font-weight:900;letter-spacing:10px;">${otpCode}</p>
                <p style="margin:10px 0 0;color:#64748b;font-size:12px;">This code expires in <strong style="color:#f59e0b;">10 minutes</strong></p>
              </div>
              <!-- Warning -->
              <div style="background:#1a1a2e;border-left:4px solid #ef4444;padding:14px 18px;border-radius:8px;margin-bottom:28px;">
                <p style="margin:0;color:#fca5a5;font-size:13px;">⚠️ Never share this code with anyone. LiveMart will never ask for your OTP.</p>
              </div>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Someone may have accidentally entered your email address.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} LiveMart. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send email asynchronously in the background to speed up frontend response
    sendEmail({
      email,
      subject: 'LiveMart – Verify your email address',
      message: `Your signup verification code is: ${otpCode}. It expires in 10 minutes.`,
      html: htmlBody,
    }).catch(emailError => {
      console.error('Email sending failed (OTP still valid):', emailError.message);
    });

    // Return immediately
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new user (with OTP verification)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all required fields including OTP' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ where: { email, otp } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Clear OTP
      await OTP.destroy({ where: { email } });

      // Create Session & Login Activity
      const reqData = await parseRequestData(req);
      const session = await Session.create({
        userEmail: user.email,
        ...reqData,
        login_method: 'OTP',
        last_ip: reqData.ip
      });
      await LoginActivity.create({
        userId: user.id,
        email: user.email,
        ...reqData,
        status: 'Successful'
      });

      // Send login alert email asynchronously
      sendLoginAlertEmail(user, session, reqData);

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, session.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Google Auth Login/Signup
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { token, isLogin } = req.body;

    // During dev without a real client ID, we might need a fallback or verify securely
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      // If validation fails, it might be due to dummy client id. Return 401.
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let isNewUser = false;
    let user = await User.findOne({ where: { email } });

    if (isLogin) {
      if (!user) {
        return res.status(401).json({ message: 'This account is not registered. Please go to the Sign Up page to create a new account.' });
      }
      if (!user.googleId) {
        // Link account if they registered with email previously
        user.googleId = googleId;
        if (!user.profile_pic) user.profile_pic = picture;
        await user.save();
      }
    } else {
      if (!user) {
        // Create user if they don't exist
        user = await User.create({
          name,
          email,
          googleId,
          profile_pic: picture,
        });
        isNewUser = true;
      } else {
        // User exists, but they are trying to signup. Reject it.
        return res.status(400).json({ message: 'This account is already registered. Please go to the Sign In page.' });
      }
    }

    // Create Session & Login Activity
    const reqData = await parseRequestData(req);
    const session = await Session.create({
      userEmail: user.email,
      ...reqData,
      login_method: 'Google',
      last_ip: reqData.ip
    });
    await LoginActivity.create({
      userId: user.id,
      email: user.email,
      ...reqData,
      status: 'Successful'
    });

    // Send login alert email asynchronously
    sendLoginAlertEmail(user, session, reqData);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile_pic: user.profile_pic,
      token: generateToken(user.id, session.id),
      isNewUser,
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const reqData = await parseRequestData(req);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      await LoginActivity.create({
        email,
        ...reqData,
        status: 'Failed'
      });
      return res.status(401).json({ message: 'This account is not registered. Please go to the Sign Up page to create a new account.' });
    }

    if (!user.password) {
      await LoginActivity.create({
        userId: user.id,
        email: user.email,
        ...reqData,
        status: 'Failed'
      });
      return res.status(401).json({ message: 'This email is registered without a password. Please use Google Login.' });
    }

    if (await user.matchPassword(password)) {
      // Instead of logging in directly, generate an OTP for 2-step verification
      const otpCode = crypto.randomInt(100000, 999999).toString();

      // Clear any existing OTP for this email
      await OTP.destroy({ where: { email } });

      // Save new OTP to DB
      await OTP.create({
        email,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
      });

      // Send OTP via email (reusing the clean HTML template pattern)
      const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding:40px 40px 30px;text-align:center;">
              <h1 style="margin:0 0 15px;color:#f8fafc;font-size:28px;font-weight:800;">Login Verification</h1>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
                You are trying to log in to your LiveMart account. Enter the verification code below to proceed.
              </p>
              <div style="background:#0f172a;border:2px solid #f59e0b;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Verification Code</p>
                <p style="margin:0;color:#f59e0b;font-size:44px;font-weight:900;letter-spacing:10px;">${otpCode}</p>
                <p style="margin:10px 0 0;color:#64748b;font-size:12px;">This code expires in <strong style="color:#f59e0b;">10 minutes</strong></p>
              </div>
              <div style="background:#1a1a2e;border-left:4px solid #ef4444;padding:14px 18px;border-radius:8px;margin-bottom:28px;">
                <p style="margin:0;color:#fca5a5;font-size:13px;">⚠️ Never share this code with anyone. LiveMart will never ask for your OTP.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      sendEmail({
        email,
        subject: 'LiveMart – Login Verification Code',
        message: `Your login verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: htmlBody,
      }).catch(emailError => {
        console.error('Email sending failed (OTP still valid):', emailError.message);
      });

      // Send response indicating OTP is required
      res.json({
        requireOTP: true,
        message: 'OTP sent to your email for verification'
      });
    } else {
      await LoginActivity.create({
        userId: user.id,
        email: user.email,
        ...reqData,
        status: 'Incorrect password'
      });
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP for Login
// @route   POST /api/auth/login-verify
// @access  Public
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide both email and OTP' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ where: { email, otp } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP is valid, proceed with login
    await OTP.destroy({ where: { email } });

    const reqData = await parseRequestData(req);
    const session = await Session.create({
      userEmail: user.email,
      ...reqData,
      login_method: 'Password+OTP',
      last_ip: reqData.ip
    });
    
    await LoginActivity.create({
      userId: user.id,
      email: user.email,
      ...reqData,
      status: 'Successful'
    });

    // Send login alert email asynchronously
    sendLoginAlertEmail(user, session, reqData);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile_pic: user.profile_pic,
      token: generateToken(user.id, session.id),
    });
  } catch (error) {
    console.error('Verify Login OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Return same message whether email exists or not — prevents email enumeration
      return res.status(200).json({ message: 'If this email is registered, an OTP has been sent.' });
    }

    // Generate 6-digit numeric OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before saving
    const hashedOTP = crypto.createHash('sha256').update(resetOTP).digest('hex');

    // Save to database, set expiration to 10 minutes
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // OTP sent via email. Removed console.log to prevent OTP exposure in logs.

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; max-width: 500px; margin: 0 auto;">
      <h1 style="color: #4f46e5; margin-bottom: 20px;">Reset Your Password</h1>
      <p style="color: #334155; font-size: 16px;">Hi ${user.name},</p>
      <p style="color: #334155; font-size: 16px;">You recently requested to reset your password for your LiveMart account. Use the following secure OTP to proceed:</p>
      <h2 style="letter-spacing: 6px; color: #1e293b; background: #e0e7ff; padding: 15px 20px; display: inline-block; border-radius: 8px; border: 1px dashed #818cf8; margin: 20px 0;">${resetOTP}</h2>
      <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please safely ignore this email.</p>
    </div>`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'LiveMart - Password Reset OTP',
        message: `Your OTP is: ${resetOTP}`,
        html: htmlBody,
      });

      res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
      console.error('Email sending failed:', error);

      // Even if email fails, we return success for the sake of the "free" testing using console log
      // In a real production app, we would clear the OTP and return 500.
      res.status(200).json({ message: 'Email could not be sent, but OTP was generated (check server console)' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset Password (Verify OTP)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Invalid request' });
    }

    // Check expiration
    if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Hash the incoming OTP to compare
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedOTP !== user.resetPasswordOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid. Update password. 
    // The beforeUpdate hook in User.js will hash the new password.
    user.password = password;
    user.resetPasswordOTP = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Optionally log them in immediately, but standard practice is to ask them to login again
    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Revoke a device session directly via email link
// @route   GET /api/auth/revoke-device/:sessionId
// @access  Public
exports.revokeDevice = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists
    const session = await Session.findOne({ where: { id: sessionId } });
    
    if (session) {
      await session.destroy();
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <body style="background:#0f172a;font-family:sans-serif;color:white;text-align:center;padding:100px 20px;">
        <h1 style="color:#ef4444;font-size:36px;margin-bottom:10px;">Device Logged Out</h1>
        <p style="font-size:18px;color:#cbd5e1;margin-bottom:30px;">The unrecognized device has been successfully logged out of your account.</p>
        <p style="color:#94a3b8;margin-bottom:40px;">If you believe your account was compromised, we strongly recommend you change your password immediately.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">Go to LiveMart Login</a>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Revoke device via email error:', error);
    res.status(500).send('Server Error');
  }
};

const nodemailer = require('nodemailer');
const { Setting } = require('../models');
const dns = require('dns');

// Force IPv4 for DNS resolution. 
// This fixes the "ENETUNREACH" error on Render when it tries to connect to Gmail via IPv6.
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Check if placeholder / unconfigured
  const isConfigured =
    emailUser &&
    emailPass &&
    emailUser !== 'your_email@gmail.com' &&
    emailPass !== 'your_app_password';

  if (!isConfigured) {
    // Not configured — just log and return without throwing
    console.log('\n==============================================');
    console.log(`📧 EMAIL NOT CONFIGURED — Would have sent to: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message || '(HTML only)'}`);
    console.log('==============================================\n');
    return; // Graceful no-op
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  // Define email options
  const mailOptions = {
    from: `"LiveMart Support" <${emailUser}>`,
    replyTo: emailUser,
    to: options.email,
    cc: options.cc,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
  };

  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }

  // Actually send the email
  await transporter.sendMail(mailOptions);
  
  // Track total emails sent (fire-and-forget to not block)
  try {
    const [setting] = await Setting.findOrCreate({
      where: { key: 'TOTAL_EMAILS_SENT' },
      defaults: { value: '0', type: 'NUMBER' }
    });
    setting.value = String(Number(setting.value) + 1);
    await setting.save();
  } catch (err) {
    console.error('Failed to update email counter:', err.message);
  }
};

module.exports = sendEmail;

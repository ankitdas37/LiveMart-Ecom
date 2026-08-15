const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { Setting } = require('../models');

const sendEmail = async (options) => {
  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const emailUser = process.env.EMAIL_USER;

  // Check if Gmail API is configured
  if (!clientSecret || !refreshToken || !emailUser) {
    console.log('\n==============================================');
    console.log(`📧 EMAIL NOT CONFIGURED — Would have sent to: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message || '(HTML only)'}`);
    console.log('==============================================\n');
    return;
  }

  // Set up OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Configure Nodemailer just to build the perfect MIME string (no SMTP)
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      buffer: true
    });

    const domain = emailUser.includes('@') ? emailUser.split('@')[1] : 'wiformart.com';
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${domain}>`;

    // Map attachments format for Nodemailer
    let formattedAttachments = [];
    if (options.attachments && options.attachments.length > 0) {
      formattedAttachments = options.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || 'application/octet-stream',
      }));
    }

    const mailOptions = {
      from: `"W!FO MART Support" <${emailUser}>`,
      to: options.email,
      cc: options.cc,
      replyTo: emailUser,
      subject: options.subject,
      text: options.message || 'Please view this email in an HTML-compatible email client.',
      html: options.html || `<p>${options.message || ''}</p>`,
      attachments: formattedAttachments,
      messageId: messageId,
      date: new Date(),
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Base64 URL-encode the compiled message as required by Gmail API
    const encodedMessage = info.message
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send using Gmail REST API (bypasses local SMTP IPv6 routing issues)
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log(`📧 Email sent to ${options.email}: ${options.subject}`);

    // Track total emails sent (fire-and-forget)
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

  } catch (err) {
    console.error(`❌ Mail delivery failed to ${options.email}:`, err.message);
    try {
      const [setting] = await Setting.findOrCreate({
        where: { key: 'LAST_EMAIL_ERROR' },
        defaults: { value: '', type: 'STRING' }
      });
      setting.value = `${new Date().toISOString()} - To: ${options.email} - Error: ${err.message}`;
      await setting.save();
    } catch (dbErr) {
      // ignore
    }
    throw err;
  }
};

module.exports = sendEmail;

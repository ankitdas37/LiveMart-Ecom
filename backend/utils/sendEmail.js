const { google } = require('googleapis');
const { Setting } = require('../models');

const sendEmail = async (options) => {
  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const emailUser = process.env.EMAIL_USER;

  // Check if Gmail API is configured
  if (!clientSecret || !refreshToken) {
    console.log('\n==============================================');
    console.log(`📧 EMAIL NOT CONFIGURED — Would have sent to: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message || '(HTML only)'}`);
    console.log('==============================================\n');
    return;
  }

  // Set up OAuth2 client — uses HTTPS, works on Render free tier
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Build a proper RFC 2822 email message
  // Encode subject using RFC 2047 to handle Unicode chars (em-dashes, emojis, etc.)
  const encodeSubject = (subject) => `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  const messageParts = [
    `From: "LiveMart Support" <${emailUser}>`,
    `To: ${options.email}`,
    `Subject: ${encodeSubject(options.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    options.html || `<p>${options.message || ''}</p>`,
  ];

  if (options.cc) {
    const cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
    messageParts.splice(2, 0, `Cc: ${cc}`);
  }

  const rawMessage = messageParts.join('\n');
  // Base64 URL-encode the message as required by Gmail API
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

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
};

module.exports = sendEmail;


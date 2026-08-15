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

  // Encode subject using RFC 2047 to handle Unicode chars (em-dashes, emojis, etc.)
  const encodeSubject = (subject) => `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  let rawMessage;
  const hasAttachments = options.attachments && options.attachments.length > 0;
  
  const boundaryMixed = `boundary_mixed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const boundaryAlt = `boundary_alt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  const domain = emailUser && emailUser.includes('@') ? emailUser.split('@')[1] : 'wiformart.com';
  const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${domain}>`;
  
  const baseHeaders = [
    `From: "W!FO MART Support" <${emailUser}>`,
    `To: ${options.email}`,
    options.cc ? `Cc: ${Array.isArray(options.cc) ? options.cc.join(', ') : options.cc}` : '',
    `Reply-To: ${emailUser}`,
    `Subject: ${encodeSubject(options.subject)}`,
    `Message-ID: ${messageId}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
  ].filter(Boolean);

  const plainTextBody = options.message || 'Please view this email in an HTML-compatible email client.';
  const htmlBody = options.html || `<p>${options.message || ''}</p>`;

  let body = '';

  if (hasAttachments) {
    // multipart/mixed wrapper for attachments
    body += baseHeaders.join('\n') + '\n';
    body += `Content-Type: multipart/mixed; boundary="${boundaryMixed}"\n\n`;
    
    // Add the multipart/alternative body inside the mixed boundary
    body += `--${boundaryMixed}\n`;
    body += `Content-Type: multipart/alternative; boundary="${boundaryAlt}"\n\n`;
    
    // Plain text part
    body += `--${boundaryAlt}\n`;
    body += `Content-Type: text/plain; charset=utf-8\n\n`;
    body += `${plainTextBody}\n\n`;
    
    // HTML part
    body += `--${boundaryAlt}\n`;
    body += `Content-Type: text/html; charset=utf-8\n\n`;
    body += `${htmlBody}\n\n`;
    
    body += `--${boundaryAlt}--\n\n`; // End of alternative

    // Attachments
    for (const att of options.attachments) {
      const contentBase64 = Buffer.isBuffer(att.content)
        ? att.content.toString('base64')
        : Buffer.from(att.content).toString('base64');
      
      body += `--${boundaryMixed}\n`;
      body += `Content-Type: ${att.contentType || 'application/octet-stream'}; name="${att.filename}"\n`;
      body += `Content-Disposition: attachment; filename="${att.filename}"\n`;
      body += `Content-Transfer-Encoding: base64\n\n`;
      body += `${contentBase64}\n\n`;
    }
    
    body += `--${boundaryMixed}--`;
    rawMessage = body;
  } else {
    // Just multipart/alternative since there are no attachments
    body += baseHeaders.join('\n') + '\n';
    body += `Content-Type: multipart/alternative; boundary="${boundaryAlt}"\n\n`;
    
    // Plain text part
    body += `--${boundaryAlt}\n`;
    body += `Content-Type: text/plain; charset=utf-8\n\n`;
    body += `${plainTextBody}\n\n`;
    
    // HTML part
    body += `--${boundaryAlt}\n`;
    body += `Content-Type: text/html; charset=utf-8\n\n`;
    body += `${htmlBody}\n\n`;
    
    body += `--${boundaryAlt}--`;
    rawMessage = body;
  }

  // Base64 URL-encode the message as required by Gmail API
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
    console.log(`📧 Email sent to ${options.email}: ${options.subject}`);
  } catch (err) {
    console.error(`❌ Gmail API failed to send email to ${options.email}:`, err.message);
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


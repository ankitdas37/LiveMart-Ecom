const { Resend } = require('resend');
const { Setting } = require('../models');

const sendEmail = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailUser = process.env.EMAIL_USER;

  // Check if Resend is configured
  if (!resendApiKey || resendApiKey === 'your_resend_api_key') {
    // Not configured — just log and return without throwing
    console.log('\n==============================================');
    console.log(`📧 EMAIL NOT CONFIGURED — Would have sent to: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message || '(HTML only)'}`);
    console.log('==============================================\n');
    return; // Graceful no-op
  }

  const resend = new Resend(resendApiKey);

  // On Resend's free plan, you can only send FROM onboarding@resend.dev
  // unless you verify a custom domain. Change RESEND_FROM_EMAIL in your env
  // after verifying your domain.
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const payload = {
    from: `LiveMart Support <${fromAddress}>`,
    reply_to: emailUser,
    to: [options.email],
    subject: options.subject,
    text: options.message || options.text || '',
    html: options.html || `<p>${options.message || ''}</p>`,
  };

  if (options.cc) {
    payload.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
  }

  if (options.attachments) {
    payload.attachments = options.attachments;
  }

  const { error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

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


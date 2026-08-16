const webpush = require('web-push');
const { PushSubscription } = require('../models');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@wifomart.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const sendWebPush = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.findAll({ where: { userId } });
    const pushPayload = JSON.stringify(payload);
    
    for (const sub of subscriptions) {
      try {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        await webpush.sendNotification(pushSub, pushPayload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid
          await sub.destroy();
        } else {
          console.error('Error sending push:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error in sendWebPush:', error);
  }
};

module.exports = { sendWebPush };

const { User, OTP } = require('./models');

async function test() {
  try {
    const user = await User.findOne();
    if (!user) { console.log('No user'); return; }
    console.log('User:', user.email);
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.destroy({ where: { email: user.email } });
    console.log('Destroyed');
    
    await OTP.create({ email: user.email, otp: otpCode, expiresAt });
    console.log('Created');
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();

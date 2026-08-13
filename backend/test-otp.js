const { OTP, sequelize } = require('./models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    const otp = await OTP.create({
      email: 'test@example.com',
      otp: '123456',
      expiresAt: new Date(Date.now() + 10000)
    });
    console.log('Created:', otp.toJSON());
    await OTP.destroy({ where: { email: 'test@example.com' } });
    console.log('Destroyed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};
run();

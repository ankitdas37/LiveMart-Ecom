const { sendAdminActionOTP } = require('./controllers/userController');
const { User } = require('./models');
const { connectDB } = require('./config/db');

const run = async () => {
  await connectDB();
  const user = await User.findOne({ where: { role: 'admin' } });
  
  if (!user) {
    console.log('No admin user found.');
    process.exit(1);
  }

  const req = { user };
  const res = {
    json: (data) => console.log('RES.JSON:', data),
    status: (code) => {
      console.log('RES.STATUS:', code);
      return { json: (data) => console.log('RES.JSON:', data) };
    }
  };

  try {
    await sendAdminActionOTP(req, res);
  } catch (err) {
    console.error('Unhandled Error:', err);
  }
  process.exit(0);
};

run();

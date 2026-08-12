const { sequelize } = require('./config/db');

const fixIPs = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query("UPDATE Sessions SET ip_address = '127.0.0.1', last_ip = '127.0.0.1' WHERE ip_address IS NULL;");
    console.log('Fixed missing IPs');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

fixIPs();

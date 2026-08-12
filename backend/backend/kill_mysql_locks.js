const mysql = require('mysql2/promise');
require('dotenv').config();

async function killLocks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    
    const [rows] = await connection.query("SHOW FULL PROCESSLIST");
    console.log("Process List:", rows);
    
    let killed = 0;
    for (const row of rows) {
      // Don't kill our own connection
      if (row.Command === 'Sleep' || row.Command === 'Query') {
        if (row.Id !== connection.threadId && row.User !== 'system user') {
          console.log(`Killing thread ${row.Id} (${row.State}: ${row.Info})`);
          await connection.query(`KILL ${row.Id}`);
          killed++;
        }
      }
    }
    console.log(`Killed ${killed} processes.`);
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}
killLocks();

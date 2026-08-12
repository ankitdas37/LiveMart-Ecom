// Comprehensive fix script - drops ALL duplicate UNIQUE indexes across all tables
// This was caused by Sequelize alter:true running repeatedly on every server restart
const mysql = require('mysql2/promise');
require('dotenv').config();

const fixAllDuplicateIndexes = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Connected to MySQL...\n');

  // Get all tables in the database
  const [tables] = await conn.execute(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE';"
  );

  let totalDropped = 0;

  for (const { TABLE_NAME } of tables) {
    // Get all indexes for this table
    const [indexes] = await conn.execute(`SHOW INDEX FROM \`${TABLE_NAME}\`;`);
    
    // Group by column_name to find duplicates (exclude PRIMARY)
    const columnIndexMap = {};
    for (const idx of indexes) {
      if (idx.Key_name === 'PRIMARY') continue;
      const col = idx.Column_name;
      if (!columnIndexMap[col]) columnIndexMap[col] = [];
      columnIndexMap[col].push(idx.Key_name);
    }

    // For each column that has more than 1 index, drop all but the first/canonical one
    for (const [col, indexNames] of Object.entries(columnIndexMap)) {
      if (indexNames.length <= 1) continue;
      
      // Keep the canonical index (the one named exactly the column name), or the first one
      const canonical = indexNames.includes(col) ? col : indexNames[0];
      const toDrop = indexNames.filter(n => n !== canonical);
      
      console.log(`Table [${TABLE_NAME}] column [${col}]: keeping '${canonical}', dropping ${toDrop.length} duplicates`);
      
      for (const idxName of toDrop) {
        try {
          await conn.execute(`ALTER TABLE \`${TABLE_NAME}\` DROP INDEX \`${idxName}\`;`);
          totalDropped++;
          process.stdout.write('.');
        } catch (err) {
          console.error(`\n  Error dropping ${idxName} on ${TABLE_NAME}: ${err.message}`);
        }
      }
      console.log('');
    }
  }

  console.log(`\n✅ Done! Total indexes dropped: ${totalDropped}`);
  
  // Verify
  console.log('\nRemaining index counts per table:');
  const [counts] = await conn.execute(
    "SELECT TABLE_NAME, COUNT(*) as cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() GROUP BY TABLE_NAME ORDER BY cnt DESC;"
  );
  counts.forEach(r => console.log(`  ${r.TABLE_NAME}: ${r.cnt}`));
  
  await conn.end();
  process.exit(0);
};

fixAllDuplicateIndexes().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

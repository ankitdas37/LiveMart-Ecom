// Script to fix the Brands table by dropping all duplicate indexes
// Keep only the PRIMARY key and the original 'name' unique index
const { sequelize } = require('./config/db');
require('dotenv').config();

const fixBrandsTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL...');

    // Get all indexes on Brands table
    const [results] = await sequelize.query("SHOW INDEX FROM `Brands`;");
    
    // Find all unique indexes on 'name' column (except PRIMARY)
    const nameIndexes = results.filter(r => r.Column_name === 'name' && r.Key_name !== 'PRIMARY');
    
    console.log(`Found ${nameIndexes.length} indexes on 'name' column`);
    
    // Keep the first one ('name'), drop all others
    let kept = false;
    for (const idx of nameIndexes) {
      if (!kept && idx.Key_name === 'name') {
        console.log(`Keeping index: ${idx.Key_name}`);
        kept = true;
        continue;
      }
      // Drop duplicate index
      try {
        await sequelize.query(`ALTER TABLE \`Brands\` DROP INDEX \`${idx.Key_name}\`;`);
        console.log(`Dropped index: ${idx.Key_name}`);
      } catch (err) {
        console.error(`Failed to drop ${idx.Key_name}:`, err.message);
      }
    }
    
    // If 'name' index wasn't found, keep the first one
    if (!kept && nameIndexes.length > 0) {
      const first = nameIndexes[0];
      console.log(`Keeping first index: ${first.Key_name}`);
      for (let i = 1; i < nameIndexes.length; i++) {
        try {
          await sequelize.query(`ALTER TABLE \`Brands\` DROP INDEX \`${nameIndexes[i].Key_name}\`;`);
          console.log(`Dropped index: ${nameIndexes[i].Key_name}`);
        } catch (err) {
          console.error(`Failed to drop ${nameIndexes[i].Key_name}:`, err.message);
        }
      }
    }

    // Verify
    const [after] = await sequelize.query("SHOW INDEX FROM `Brands`;");
    console.log('\n✅ Brands table indexes after cleanup:');
    after.forEach(r => console.log(`  - ${r.Key_name} on ${r.Column_name}`));
    
    console.log('\n✅ Done! Brands table fixed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixBrandsTable();

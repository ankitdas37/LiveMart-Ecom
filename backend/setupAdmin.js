/**
 * Admin Setup Script
 * - Sets W!FOMART.support@gmail.com as the SUPER ADMIN
 * - Demotes sjmusic00a@gmail.com to regular user
 * - Creates the super admin account if it doesn't exist yet
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  { host: process.env.DB_HOST || 'localhost', dialect: 'mysql', logging: false }
);

// These values MUST be set in your .env file — never hardcode them
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SUPER_ADMIN_NAME  = process.env.ADMIN_NAME || 'W!FOMART Admin';
const SUPER_ADMIN_PASS  = process.env.ADMIN_PASSWORD;
const DEMOTE_EMAIL      = process.env.DEMOTE_EMAIL; // optional

if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASS) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file before running this script.');
  process.exit(1);
}

async function setupAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // ── 1. Show current users ──────────────────────────────────────────────
    const [users] = await sequelize.query(
      `SELECT id, name, email, role FROM Users ORDER BY id`
    );
    console.log('📋 Current users:');
    users.forEach(u => console.log(`  ${u.id}. ${u.name} <${u.email}> — ${u.role}`));
    console.log('');

    // ── 2. Demote sjmusic00a to user ───────────────────────────────────────
    const [demoteResult] = await sequelize.query(
      `SELECT id, name, email, role FROM Users WHERE email = ?`,
      { replacements: [DEMOTE_EMAIL] }
    );
    if (demoteResult.length > 0) {
      await sequelize.query(
        `UPDATE Users SET role = 'user' WHERE email = ?`,
        { replacements: [DEMOTE_EMAIL] }
      );
      console.log(`🔽 Demoted: ${DEMOTE_EMAIL} → user`);
    } else {
      console.log(`ℹ️  ${DEMOTE_EMAIL} not found in DB, skipping.`);
    }

    // ── 3. Create or promote W!FOMART.support@gmail.com to admin ──────────
    const [existing] = await sequelize.query(
      `SELECT id, name, email, role FROM Users WHERE email = ?`,
      { replacements: [SUPER_ADMIN_EMAIL] }
    );

    if (existing.length > 0) {
      await sequelize.query(
        `UPDATE Users SET role = 'admin' WHERE email = ?`,
        { replacements: [SUPER_ADMIN_EMAIL] }
      );
      console.log(`🔼 Promoted: ${SUPER_ADMIN_EMAIL} → admin`);
    } else {
      // Account doesn't exist yet — create it
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(SUPER_ADMIN_PASS, salt);
      await sequelize.query(
        `INSERT INTO Users (name, email, password, role, isVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, 'admin', 1, NOW(), NOW())`,
        { replacements: [SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, hashedPass] }
      );
      console.log(`✨ Created new admin account: ${SUPER_ADMIN_EMAIL}`);
      console.log(`   Default password: ${SUPER_ADMIN_PASS}`);
      console.log(`   ⚠️  Please change this password after first login!`);
    }

    // ── 4. Show final state ────────────────────────────────────────────────
    console.log('\n📋 Updated users:');
    const [updated] = await sequelize.query(
      `SELECT id, name, email, role FROM Users ORDER BY id`
    );
    updated.forEach(u => console.log(`  ${u.id}. ${u.name} <${u.email}> — ${u.role}`));

    console.log('\n✅ Done! W!FOMART.support@gmail.com is now the SUPER ADMIN.');
    console.log('   You can now log in to the Admin Panel with this account.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

setupAdmin();


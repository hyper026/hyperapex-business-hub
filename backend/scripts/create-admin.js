require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const [fullName, email, password] = process.argv.slice(2);
if (!fullName || !email || !password || password.length < 12) {
  console.error('Usage: node scripts/create-admin.js "Full Name" email@example.com "strong-password-min-12-chars"');
  process.exit(1);
}

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    `INSERT INTO users (full_name, email, password_hash, role, status)
     VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = 'ADMIN', status = 'ACTIVE'`,
    [fullName.trim(), email.trim().toLowerCase(), hash]
  );
  await pool.end();
  console.log('Administrator account provisioned.');
})();

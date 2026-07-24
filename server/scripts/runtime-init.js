require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const bcrypt = require('bcryptjs');
const pool = require('../db');

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      tool_name TEXT,
      result TEXT,
      model TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  const email = process.env.ADMIN_EMAIL || 'runtime-admin@example.com';
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'RuntimeAcceptance123!', 12);
  await pool.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role`,
    [email.trim().toLowerCase(), passwordHash, 'Runtime Administrator']
  );
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(`Runtime initialization failed: ${error.message}`);
    await pool.end().catch(() => {});
    process.exit(1);
  });

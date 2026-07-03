const mysql = require('mysql2/promise');
const path = require('path');
console.log('=== DB CONFIG LOADED ===');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Enforce required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Database Configuration Error: ${varName} is not configured in the environment variables.`);
  }
}

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD_LENGTH:', process.env.DB_PASSWORD?.length);
// Create connection pool using pure environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper query function
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query
};

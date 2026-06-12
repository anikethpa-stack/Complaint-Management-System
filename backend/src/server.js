const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });



const app = require('./app');
const db = require('./config/db.config');

const PORT = process.env.PORT || 5000;

/**
 * Initializes database pool checks and starts listening on the designated PORT
 */
async function startServer() {
  try {
    console.log(`[Database] Connecting to: ${process.env.DB_HOST}`);
    // Acquire connection from the pool to test network connectivity
    console.log("DB_USER =", process.env.DB_USER);
    console.log("DB_PASSWORD_LENGTH =", process.env.DB_PASSWORD?.length);
    console.log("DB_PASSWORD_RAW =", JSON.stringify(process.env.DB_PASSWORD));
    const connection = await db.pool.getConnection();
    console.log('[Database] MySQL connection pool initialized successfully.');
    connection.release();

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT}`);
      console.log('Backend Server Lifecycle Started', { port: PORT });
    });
  } catch (error) {
    console.error('[Database] Failed to connect to MySQL database:', error.message);
    console.error('Backend Server Lifecycle Failed to Start (DB failure)', { error: error.message });
    process.exit(1);
  }
}

startServer();

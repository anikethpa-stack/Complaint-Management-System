const app = require('./app');
const db = require('./config/db.config');
const { logInfo, logError } = require('./services/cloudwatch.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

/**
 * Initializes database pool checks and starts listening on the designated PORT
 */
async function startServer() {
  try {
    // Acquire connection from the pool to test network connectivity
    const connection = await db.pool.getConnection();
    console.log('[Database] MySQL connection pool initialized successfully.');
    connection.release();

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT}`);
      logInfo('Backend Server Lifecycle Started', { port: PORT });
    });
  } catch (error) {
    console.error('[Database] Failed to connect to MySQL database:', error.message);
    logError('Backend Server Lifecycle Failed to Start (DB failure)', { error: error.message });
    process.exit(1);
  }
}

startServer();

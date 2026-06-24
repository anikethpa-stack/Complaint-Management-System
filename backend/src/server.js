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
    console.log("DB_USER =", process.env.DB_USER);
    console.log("DB_PASSWORD_LENGTH =", process.env.DB_PASSWORD?.length);
    
    const connection = await db.pool.getConnection();
    console.log('[Database] MySQL connection pool initialized successfully.');

    // Automatically check and create profile columns in Users table
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM Users");
      const columnNames = columns.map(c => c.Field);
      
      if (!columnNames.includes('college')) {
        await connection.query("ALTER TABLE Users ADD COLUMN college VARCHAR(255) NULL");
        console.log('[Schema] Added "college" column to Users table.');
      }
      if (!columnNames.includes('branch')) {
        await connection.query("ALTER TABLE Users ADD COLUMN branch VARCHAR(255) NULL");
        console.log('[Schema] Added "branch" column to Users table.');
      }
      if (!columnNames.includes('semester_year')) {
        await connection.query("ALTER TABLE Users ADD COLUMN semester_year VARCHAR(50) NULL");
        console.log('[Schema] Added "semester_year" column to Users table.');
      }
      if (!columnNames.includes('degree')) {
        await connection.query("ALTER TABLE Users ADD COLUMN degree VARCHAR(100) NULL");
        console.log('[Schema] Added "degree" column to Users table.');
      }
      console.log('[Database] Schema verification complete.');
    } catch (schemaErr) {
      console.error('[Database] Schema setup warning:', schemaErr.message);
    }

    connection.release();

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT}`);
      console.log('Backend Server Lifecycle Started', { port: PORT });
    });
  } catch (error) {
    console.error('[Database] Failed to connect to MySQL database:', error.message);
    console.warn('[Server] Launching in fallback mode (Database Offline).');
    
    // Start Express listener regardless, allowing frontend API connectivity
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT} (Database Offline)`);
    });
  }
}

startServer();

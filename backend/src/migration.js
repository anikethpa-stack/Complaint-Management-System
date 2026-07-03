const db = require('./config/db.config');

async function migrate() {
  try {
    console.log('=== Database Migration Starting ===');

    // 1. Alter Complaints status ENUM
    console.log("Altering 'Complaints' table status ENUM...");
    await db.query(`
      ALTER TABLE Complaints 
      MODIFY COLUMN status ENUM('Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Pending'
    `);
    console.log("Successfully altered 'Complaints' status ENUM.");

    // 2. Alter ComplaintUpdates status ENUMs
    console.log("Altering 'ComplaintUpdates' table status ENUMs...");
    await db.query(`
      ALTER TABLE ComplaintUpdates 
      MODIFY COLUMN status_from ENUM('Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL
    `);
    await db.query(`
      ALTER TABLE ComplaintUpdates 
      MODIFY COLUMN status_to ENUM('Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL
    `);
    console.log("Successfully altered 'ComplaintUpdates' status ENUMs.");

    // 3. Add admin_remarks, assigned_by, assigned_date, resolved_date to Complaints
    const columns = await db.query('DESCRIBE Complaints');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('admin_remarks')) {
      console.log("Adding 'admin_remarks' column to 'Complaints'...");
      await db.query('ALTER TABLE Complaints ADD COLUMN admin_remarks TEXT NULL');
    }
    if (!columnNames.includes('assigned_by')) {
      console.log("Adding 'assigned_by' column to 'Complaints'...");
      await db.query('ALTER TABLE Complaints ADD COLUMN assigned_by INT NULL, ADD FOREIGN KEY (assigned_by) REFERENCES Users(id) ON DELETE SET NULL');
    }
    if (!columnNames.includes('assigned_date')) {
      console.log("Adding 'assigned_date' column to 'Complaints'...");
      await db.query('ALTER TABLE Complaints ADD COLUMN assigned_date TIMESTAMP NULL');
    }
    if (!columnNames.includes('resolved_date')) {
      console.log("Adding 'resolved_date' column to 'Complaints'...");
      await db.query('ALTER TABLE Complaints ADD COLUMN resolved_date TIMESTAMP NULL');
    }

    console.log('=== Database Migration Completed Successfully ===');
  } catch (error) {
    console.error('=== Database Migration Failed ===');
    console.error(error);
  } finally {
    process.exit(0);
  }
}

migrate();

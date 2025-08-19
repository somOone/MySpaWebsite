const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/spa.db');
let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      
      // Create tables
      createTables()
        .then(() => {
          console.log('✅ Database tables created');
          return migrateExpensesTable();
        })
        .then(() => {
          console.log('✅ Expenses table migration completed');
          return migrateToStatusBased();
        })
        .then(() => {
          console.log('✅ Status-based appointments migration completed');
          return importExistingData();
        })
        .then(() => {
          console.log('✅ Existing data imported');
          resolve();
        })
        .catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        client TEXT NOT NULL,
        category TEXT NOT NULL,
        payment REAL NOT NULL,
        tip REAL DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        update_reason VARCHAR(500) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err.message);
          reject(err);
          return;
        }
        completed++;
        if (completed === tables.length) {
          resolve();
        }
      });
    });
  });
}

function migrateExpensesTable() {
  return new Promise((resolve, reject) => {
    // Check if updated_at column exists in expenses table
    db.all("PRAGMA table_info(expenses)", (err, rows) => {
      if (err) {
        console.error('Error checking expenses table structure:', err.message);
        reject(err);
        return;
      }
      
      const hasUpdatedAt = rows.some(row => row.name === 'updated_at');
      
      if (!hasUpdatedAt) {
        // Add updated_at column
        db.run('ALTER TABLE expenses ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
          if (err) {
            console.error('Error adding updated_at column:', err.message);
            reject(err);
            return;
          }
          
          // Update existing records to have current timestamp
          db.run('UPDATE expenses SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL', (err) => {
            if (err) {
              console.error('Error updating existing expenses:', err.message);
              reject(err);
              return;
            }
            console.log('✅ Expenses table migration completed');
            resolve();
          });
        });
      } else {
        console.log('✅ Expenses table already has updated_at column');
        resolve();
      }
    });
  });
}

function migrateToStatusBased() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting migration to status-based appointments...');
    
    // Check if status column already exists
    db.all("PRAGMA table_info(appointments)", (err, columns) => {
      if (err) {
        console.error('Error checking table structure:', err.message);
        reject(err);
        return;
      }
      
      const hasStatus = columns.some(col => col.name === 'status');
      const hasCompleted = columns.some(col => col.name === 'completed');
      const hasCompletedAt = columns.some(col => col.name === 'completed_at');
      const hasUpdateReason = columns.some(col => col.name === 'update_reason');
      
      console.log('📋 Current schema:', {
        hasStatus,
        hasCompleted,
        hasCompletedAt,
        hasUpdateReason
      });
      
      if (hasStatus && !hasCompleted && !hasCompletedAt && hasUpdateReason) {
        console.log('✅ Migration already completed!');
        resolve();
        return;
      }
      
      // Since the data is already migrated, just complete the schema changes
      console.log('🔄 Completing schema migration...');
      
      // 1. Add status column if it doesn't exist
      if (!hasStatus) {
        db.run(`ALTER TABLE appointments ADD COLUMN status VARCHAR(20) DEFAULT 'pending'`, (err) => {
          if (err) {
            console.error('Error adding status column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added status column');
        });
      } else {
        console.log('✅ Status column already exists');
      }
      
      // 2. Remove old columns
      if (hasCompleted) {
        db.run(`ALTER TABLE appointments DROP COLUMN completed`, (err) => {
          if (err) {
            console.error('Error dropping completed column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Dropped completed column');
        });
      } else {
        console.log('✅ Completed column already dropped');
      }
      
      if (hasCompletedAt) {
        db.run(`ALTER TABLE appointments DROP COLUMN completed_at`, (err) => {
          if (err) {
            console.error('Error dropping completed_at column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Dropped completed_at column');
        });
      } else {
        console.log('✅ Completed_at column already dropped');
      }
      
      // 3. Add update_reason column if it doesn't exist
      if (!hasUpdateReason) {
        db.run(`ALTER TABLE appointments ADD COLUMN update_reason VARCHAR(500) NULL`, (err) => {
          if (err) {
            console.error('Error adding update_reason column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added update_reason column');
        });
      } else {
        console.log('✅ Update_reason column already exists');
      }
      
      // 4. Add constraint if it doesn't exist
      db.run(`ALTER TABLE appointments ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))`, (err) => {
        if (err) {
          // Constraint might already exist, that's okay
          console.log('ℹ️ Status constraint already exists or not needed');
        } else {
          console.log('✅ Added status constraint');
        }
        
        console.log('🎉 Migration to status-based appointments completed successfully!');
        resolve();
      });
    });
  });
}

function importExistingData() {
  return new Promise((resolve, reject) => {
    // Check if we already have data
    db.get('SELECT COUNT(*) as count FROM appointments', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        console.log('Database already has data, skipping sample data import...');
        resolve();
        return;
      }

      // Import sample data
      const sampleAppointments = [
        ['2025-08-16', '10:00 AM', 'Sarah Johnson', 'Facial', 100.00, 15.00, 'pending'],
        ['2025-08-16', '2:00 PM', 'Mike Chen', 'Massage', 120.00, 20.00, 'pending'],
        ['2025-08-17', '11:00 AM', 'Emily Davis', 'Facial + Massage', 200.00, 25.00, 'pending'],
        ['2025-08-18', '3:00 PM', 'David Wilson', 'Facial', 100.00, 18.00, 'pending'],
        ['2025-08-19', '1:00 PM', 'Lisa Brown', 'Massage', 120.00, 22.00, 'pending']
      ];

      const sampleExpenses = [
        ['2025-08-01', 'Massage oil supplies', 45.00, 'Supplies'],
        ['2025-08-05', 'Facial products restock', 78.50, 'Products'],
        ['2025-08-10', 'Utility bill', 120.00, 'Utilities'],
        ['2025-08-15', 'Cleaning supplies', 32.00, 'Supplies']
      ];

      let completed = 0;
      const total = sampleAppointments.length + sampleExpenses.length;

      // Insert appointments
      sampleAppointments.forEach((appt, index) => {
        db.run(
          'INSERT INTO appointments (date, time, client, category, payment, tip, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          appt,
          (err) => {
            if (err) {
              console.error('Error inserting appointment:', err.message);
            }
            completed++;
            if (completed === total) resolve();
          }
        );
      });

      // Insert expenses
      sampleExpenses.forEach((exp, index) => {
        db.run(
          'INSERT INTO expenses (date, description, amount, category) VALUES (?, ?, ?, ?)',
          exp,
          (err) => {
            if (err) {
              console.error('Error inserting expense:', err.message);
            }
            completed++;
            if (completed === total) resolve();
          }
        );
      });
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase
};

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
        completed BOOLEAN DEFAULT 0,
        completed_at DATETIME,
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
    db.get("PRAGMA table_info(expenses)", (err, rows) => {
      if (err) {
        console.error('Error checking expenses table structure:', err.message);
        reject(err);
        return;
      }
      
      db.all("PRAGMA table_info(expenses)", (err, columns) => {
        if (err) {
          console.error('Error getting expenses table columns:', err.message);
          reject(err);
          return;
        }
        
        const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
        
        if (!hasUpdatedAt) {
          console.log('Adding updated_at column to expenses table...');
          db.run('ALTER TABLE expenses ADD COLUMN updated_at DATETIME', (err) => {
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
        ['2025-08-16', '10:00 AM', 'Sarah Johnson', 'Facial', 100.00, 15.00, 0],
        ['2025-08-16', '2:00 PM', 'Mike Chen', 'Massage', 120.00, 20.00, 0],
        ['2025-08-17', '11:00 AM', 'Emily Davis', 'Facial + Massage', 200.00, 25.00, 0],
        ['2025-08-18', '3:00 PM', 'David Wilson', 'Facial', 100.00, 18.00, 0],
        ['2025-08-19', '1:00 PM', 'Lisa Brown', 'Massage', 120.00, 22.00, 0]
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
          'INSERT INTO appointments (date, time, client, category, payment, tip, completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
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

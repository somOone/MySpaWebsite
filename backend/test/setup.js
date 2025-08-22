const sqlite3 = require('sqlite3').verbose();

// Create in-memory test database
const testDb = new sqlite3.Database(':memory:');

// Initialize test database with schema synchronously
const initializeTestDb = () => {
  return new Promise((resolve, reject) => {
    // Enable foreign keys
    testDb.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create tables
      const createTables = [
        `CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          client TEXT NOT NULL,
          category TEXT NOT NULL,
          payment REAL NOT NULL,
          tip REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'pending',
          update_reason VARCHAR(500) NULL
        )`,
        `CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          category_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME
        )`,
        `CREATE TABLE IF NOT EXISTS expense_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#6B7280',
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      let completed = 0;
      createTables.forEach((sql) => {
        testDb.run(sql, (err) => {
          if (err) {
            reject(err);
            return;
          }
          completed++;
          if (completed === createTables.length) {
            // Seed some test data
            seedTestData().then(resolve).catch(reject);
          }
        });
      });
    });
  });
};

// Seed test data
const seedTestData = () => {
  return new Promise((resolve, reject) => {
    const seedData = [
      // Expense categories
      `INSERT OR IGNORE INTO expense_categories (id, name, description, color) VALUES 
        (1, 'Supplies', 'Cleaning products, spa materials, office supplies', '#3B82F6'),
        (2, 'Equipment', 'Spa equipment, maintenance tools, technology', '#10B981'),
        (3, 'Services', 'Professional services, maintenance, utilities', '#F59E0B'),
        (4, 'Marketing', 'Advertising, promotions, social media', '#EF4444'),
        (5, 'Other', 'Miscellaneous business expenses', '#6B7280')`
    ];

    let completed = 0;
    seedData.forEach((sql) => {
      testDb.run(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        completed++;
        if (completed === seedData.length) {
          resolve();
        }
      });
    });
  });
};

// Get the test database instance
const getTestDb = () => {
  return testDb;
};

module.exports = { 
  testDb: getTestDb,
  initializeTestDb,
  getTestDb
};

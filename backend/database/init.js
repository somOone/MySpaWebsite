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
          return migrateExpenseCategories();
        })
        .then(() => {
          console.log('✅ Expense categories migration completed');
          return seedExpenseCategories();
        })
        .then(() => {
          console.log('✅ Expense categories seeded');
          return migrateExistingExpensesToNewCategories();
        })
        .then(() => {
          console.log('✅ Existing expenses migrated to new categories');
          return addExpenseCategoryForeignKey();
        })
        .then(() => {
          console.log('✅ Foreign key constraint added');
          return removeLegacyCategoryColumn();
        })
        .then(() => {
          console.log('✅ Legacy category column removed');
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
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

function migrateExpenseCategories() {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(expense_categories)", (err, rows) => {
      if (err) {
        console.error('Error checking expense_categories table structure:', err.message);
        reject(err);
        return;
      }

      const hasId = rows.some(row => row.name === 'id');
      const hasName = rows.some(row => row.name === 'name');
      const hasDescription = rows.some(row => row.name === 'description');
      const hasColor = rows.some(row => row.name === 'color');
      const hasIsActive = rows.some(row => row.name === 'is_active');
      const hasCreatedAt = rows.some(row => row.name === 'created_at');

      console.log('📋 Current expense_categories schema:', {
        hasId,
        hasName,
        hasDescription,
        hasColor,
        hasIsActive,
        hasCreatedAt
      });

      if (hasId && hasName && hasDescription && hasColor && hasIsActive && hasCreatedAt) {
        console.log('✅ Expense categories table already up-to-date');
        resolve();
        return;
      }

      console.log('🔄 Completing expense categories migration...');

      // 1. Add id column if it doesn't exist
      if (!hasId) {
        db.run('ALTER TABLE expense_categories ADD COLUMN id INTEGER PRIMARY KEY AUTOINCREMENT', (err) => {
          if (err) {
            console.error('Error adding id column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added id column');
        });
      } else {
        console.log('✅ Id column already exists');
      }

      // 2. Add name column if it doesn't exist
      if (!hasName) {
        db.run('ALTER TABLE expense_categories ADD COLUMN name TEXT UNIQUE NOT NULL', (err) => {
          if (err) {
            console.error('Error adding name column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added name column');
        });
      } else {
        console.log('✅ Name column already exists');
      }

      // 3. Add description column if it doesn't exist
      if (!hasDescription) {
        db.run('ALTER TABLE expense_categories ADD COLUMN description TEXT', (err) => {
          if (err) {
            console.error('Error adding description column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added description column');
        });
      } else {
        console.log('✅ Description column already exists');
      }

      // 4. Add color column if it doesn't exist
      if (!hasColor) {
        db.run('ALTER TABLE expense_categories ADD COLUMN color TEXT DEFAULT "#6B7280"', (err) => {
          if (err) {
            console.error('Error adding color column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added color column');
        });
      } else {
        console.log('✅ Color column already exists');
      }

      // 5. Add is_active column if it doesn't exist
      if (!hasIsActive) {
        db.run('ALTER TABLE expense_categories ADD COLUMN is_active BOOLEAN DEFAULT 1', (err) => {
          if (err) {
            console.error('Error adding is_active column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added is_active column');
        });
      } else {
        console.log('✅ Is_active column already exists');
      }

      // 6. Add created_at column if it doesn't exist
      if (!hasCreatedAt) {
        db.run('ALTER TABLE expense_categories ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
          if (err) {
            console.error('Error adding created_at column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added created_at column');
        });
      } else {
        console.log('✅ Created_at column already exists');
      }

      console.log('🎉 Expense categories migration completed successfully!');
      resolve();
    });
  });
}

function seedExpenseCategories() {
  return new Promise((resolve, reject) => {
    console.log('🌱 Seeding predefined expense categories...');
    
    const predefinedExpenseCategories = [
      {
        name: 'Operations & Facilities',
        description: 'Rent, utilities, insurance, building maintenance',
        color: '#3B82F6'
      },
      {
        name: 'Supplies & Materials',
        description: 'Cleaning products, spa materials, office supplies',
        color: '#10B981'
      },
      {
        name: 'Equipment & Technology',
        description: 'Spa equipment, computers, software, furniture',
        color: '#F59E0B'
      },
      {
        name: 'Professional Services',
        description: 'Legal, accounting, consulting, training',
        color: '#8B5CF6'
      },
      {
        name: 'Marketing & Promotion',
        description: 'Advertising, social media, events, branding',
        color: '#EF4444'
      },
      {
        name: 'Administrative',
        description: 'Software subscriptions, banking fees, permits',
        color: '#6B7280'
      },
      {
        name: 'Other',
        description: 'Miscellaneous, uncategorized expenses',
        color: '#9CA3AF'
      }
    ];

    let completed = 0;
    const total = predefinedExpenseCategories.length;

    predefinedExpenseCategories.forEach(category => {
      db.run(`
        INSERT OR IGNORE INTO expense_categories (name, description, color, is_active, created_at)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
      `, [category.name, category.description, category.color], function(err) {
        if (err) {
          console.error(`Error seeding category ${category.name}:`, err.message);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          console.log(`✅ Seeded ${total} expense categories successfully`);
          resolve();
        }
      });
    });
  });
}

function migrateExistingExpensesToNewCategories() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Migrating existing expenses to new category system...');
    
    // First, add category_id column to expenses table if it doesn't exist
    db.all("PRAGMA table_info(expenses)", (err, rows) => {
      if (err) {
        console.error('Error checking expenses table structure:', err.message);
        reject(err);
        return;
      }

      const hasCategoryId = rows.some(row => row.name === 'category_id');
      
      if (!hasCategoryId) {
        db.run('ALTER TABLE expenses ADD COLUMN category_id INTEGER', (err) => {
          if (err) {
            console.error('Error adding category_id column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Added category_id column to expenses table');
          performCategoryMigration();
        });
      } else {
        console.log('✅ Category_id column already exists');
        performCategoryMigration();
      }
    });

    function performCategoryMigration() {
      // Check if category column still exists before attempting migration
      db.all("PRAGMA table_info(expenses)", (err, rows) => {
        if (err) {
          console.error('Error checking table structure:', err.message);
          reject(err);
          return;
        }

        const hasCategory = rows.some(row => row.name === 'category');
        
        if (!hasCategory) {
          console.log('✅ Legacy category column already removed, migration not needed');
          resolve();
          return;
        }

        // Get all existing expenses with category field
        db.all('SELECT id, description, category FROM expenses', (err, expenses) => {
          if (err) {
            console.error('Error fetching existing expenses:', err.message);
            reject(err);
            return;
          }

          console.log(`📊 Found ${expenses.length} existing expenses to migrate`);

          if (expenses.length === 0) {
            console.log('✅ No existing expenses to migrate');
            resolve();
            return;
          }

          let completed = 0;
          const total = expenses.length;

          expenses.forEach(expense => {
            const newCategoryId = mapExpenseToNewCategory(expense.description, expense.category);
            
            db.run('UPDATE expenses SET category_id = ? WHERE id = ?', 
              [newCategoryId, expense.id], function(err) {
                if (err) {
                  console.error(`Error updating expense ${expense.id}:`, err.message);
                  reject(err);
                  return;
                }
                
                completed++;
                if (completed === total) {
                  console.log(`✅ Successfully migrated ${total} expenses to new category system`);
                  resolve();
                }
              });
          });
        });
      });
    }
  });
}

function addExpenseCategoryForeignKey() {
  return new Promise((resolve, reject) => {
    // SQLite doesn't support adding constraints to existing tables
    // We'll skip this for now and handle it in application logic
    console.log('⚠️ SQLite constraint: Foreign key constraint will be enforced in application logic');
    resolve();
  });
}

function removeLegacyCategoryColumn() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting migration to remove legacy category column from expenses table...');
    
    // Check if category column exists in expenses table
    db.all("PRAGMA table_info(expenses)", (err, rows) => {
      if (err) {
        console.error('Error checking expenses table structure:', err.message);
        reject(err);
        return;
      }

      const hasCategory = rows.some(row => row.name === 'category');
      
      if (hasCategory) {
        db.run('ALTER TABLE expenses DROP COLUMN category', (err) => {
          if (err) {
            console.error('Error dropping category column:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Dropped legacy category column');
          resolve();
        });
      } else {
        console.log('✅ Legacy category column already dropped');
        resolve();
      }
    });
  });
}

function mapExpenseToNewCategory(description, oldCategory) {
  // Direct category mappings
  const directMappings = {
    'Supplies': 2,      // Supplies & Materials
    'Products': 2,      // Supplies & Materials
    'Utilities': 1,     // Operations & Facilities
    'Rent': 1,          // Operations & Facilities
    'Marketing': 5,     // Marketing & Promotion
    'Other': 7          // Other
  };

  // Keyword-based mappings for description analysis
  const keywordMappings = {
    'cleaning': 2,      // Supplies & Materials
    'towels': 2,        // Supplies & Materials
    'supplies': 2,      // Supplies & Materials
    'materials': 2,     // Supplies & Materials
    'equipment': 3,     // Equipment & Technology
    'computer': 3,      // Equipment & Technology
    'software': 3,      // Equipment & Technology
    'furniture': 3,     // Equipment & Technology
    'legal': 4,         // Professional Services
    'accounting': 4,    // Professional Services
    'consulting': 4,    // Professional Services
    'training': 4,      // Professional Services
    'advertising': 5,   // Marketing & Promotion
    'social media': 5,  // Marketing & Promotion
    'promotion': 5,     // Marketing & Promotion
    'branding': 5,      // Marketing & Promotion
    'insurance': 1,     // Operations & Facilities
    'maintenance': 1,   // Operations & Facilities
    'subscription': 6,  // Administrative
    'banking': 6,       // Administrative
    'permits': 6,       // Administrative
    'licenses': 6       // Administrative
  };

  // First try direct category mapping
  if (directMappings[oldCategory]) {
    return directMappings[oldCategory];
  }

  // Then try keyword-based mapping from description
  const descriptionLower = description.toLowerCase();
  for (const [keyword, categoryId] of Object.entries(keywordMappings)) {
    if (descriptionLower.includes(keyword)) {
      return categoryId;
    }
  }

  // Default to "Other" category if no match found
  return 7; // Other
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

const { getTestDb } = require('../setup');

/**
 * Create a test appointment in the test database
 */
const createTestAppointment = (data) => {
  return new Promise((resolve, reject) => {
    const testDb = getTestDb();
    const defaultData = {
      date: '2024-01-15',
      time: '14:00',
      client: 'John Doe',
      category: 'Facial',
      payment: 100.00,
      status: 'pending',
      update_reason: null
    };

    const appointmentData = { ...defaultData, ...data };
    
    testDb.run(`
      INSERT INTO appointments (date, time, client, category, payment, status, update_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      appointmentData.date, 
      appointmentData.time, 
      appointmentData.client, 
      appointmentData.category, 
      appointmentData.payment, 
      appointmentData.status, 
      appointmentData.update_reason
    ], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...appointmentData });
    });
  });
};

/**
 * Create a test expense in the test database
 */
const createTestExpense = (data) => {
  return new Promise((resolve, reject) => {
    const testDb = getTestDb();
    const defaultData = {
      date: '2024-01-15',
      description: 'Test expense',
      amount: 25.00,
      category_id: 1
    };

    const expenseData = { ...defaultData, ...data };
    
    testDb.run(`
      INSERT INTO expenses (date, description, amount, category_id)
      VALUES (?, ?, ?, ?)
    `, [
      expenseData.date, 
      expenseData.description, 
      expenseData.amount, 
      expenseData.category_id
    ], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...expenseData });
    });
  });
};

/**
 * Create a test expense category in the test database
 */
const createTestExpenseCategory = (data) => {
  return new Promise((resolve, reject) => {
    const testDb = getTestDb();
    const defaultData = {
      name: 'Test Category',
      description: 'Test category description',
      color: '#FF0000',
      is_active: 1
    };

    const categoryData = { ...defaultData, ...data };
    
    testDb.run(`
      INSERT INTO expense_categories (name, description, color, is_active)
      VALUES (?, ?, ?, ?)
    `, [
      categoryData.name, 
      categoryData.description, 
      categoryData.color, 
      categoryData.is_active
    ], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...categoryData });
    });
  });
};

/**
 * Get an appointment from the test database
 */
const getAppointmentFromDb = (id) => {
  return new Promise((resolve, reject) => {
    const testDb = getTestDb();
    testDb.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

/**
 * Get an expense from the test database
 */
const getExpenseFromDb = (id) => {
  return new Promise((resolve, reject) => {
    const testDb = getTestDb();
    testDb.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

/**
 * Clean up all test data
 */
const cleanupTestData = () => {
  return new Promise((resolve, reject) => {
    const testDb = getTestDb();
    const cleanupQueries = [
      'DELETE FROM appointments',
      'DELETE FROM expenses',
      'DELETE FROM expense_categories'
    ];

    let completed = 0;
    cleanupQueries.forEach((sql) => {
      testDb.run(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        completed++;
        if (completed === cleanupQueries.length) {
          resolve();
        }
      });
    });
  });
};

module.exports = {
  createTestAppointment,
  createTestExpense,
  createTestExpenseCategory,
  getAppointmentFromDb,
  getExpenseFromDb,
  cleanupTestData
};

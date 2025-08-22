const { getTestDb, initializeTestDb } = require('../../test/setup');
const { 
  createAppointment, 
  updateAppointment, 
  completeAppointment,
  createExpense,
  getAllExpenses
} = require('../dbUtils');

describe('Database Utilities', () => {
  let testDb;

  beforeAll(async () => {
    // Initialize test database
    await initializeTestDb();
    testDb = getTestDb();
  });

  afterAll(async () => {
    // Clean up test data after all tests
    if (testDb) {
      await testDb.run('DELETE FROM appointments');
      await testDb.run('DELETE FROM expenses');
    }
  });

  describe('createAppointment', () => {
    it('should create appointment with all required fields', async () => {
      const appointmentData = {
        date: '2024-01-15',
        time: '14:00',
        client: 'Jane Doe',
        category: 'Massage',
        payment: 120.00
      };

      const result = await createAppointment(testDb, appointmentData);
      
      expect(result.id).toBeDefined();
      expect(result.date).toBe(appointmentData.date);
      expect(result.time).toBe(appointmentData.time);
      expect(result.client).toBe(appointmentData.client);
      expect(result.category).toBe(appointmentData.category);
      expect(result.payment).toBe(appointmentData.payment);
      expect(result.status).toBe('pending');
    });

    it('should handle database errors gracefully', async () => {
      // Pass invalid database object to trigger error
      const appointmentData = {
        date: '2024-01-15',
        time: '14:00',
        client: 'Jane Doe',
        category: 'Massage',
        payment: 120.00
      };

      await expect(createAppointment(null, appointmentData))
        .rejects.toThrow();
    });
  });

  describe('updateAppointment', () => {
    let testAppointment;

    beforeEach(async () => {
      // Create a test appointment first
      testAppointment = await createAppointment(testDb, {
        date: '2024-01-15',
        time: '14:00',
        client: 'John Doe',
        category: 'Facial',
        payment: 100.00
      });
    });

    it('should handle update_reason field correctly', async () => {
      const updates = {
        category: 'Massage',
        update_reason: 'Client preference change'
      };

      const result = await updateAppointment(testDb, testAppointment.id, updates);
      
      expect(result.message).toBe('Appointment updated successfully');

      // Verify the update_reason was saved to database
      const updatedAppointment = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM appointments WHERE id = ?', [testAppointment.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(updatedAppointment.update_reason).toBe('Client preference change');
      expect(updatedAppointment.category).toBe('Massage');
      expect(updatedAppointment.updated_at).toBeDefined();
    });

    it('should update multiple fields including update_reason', async () => {
      const updates = {
        category: 'Facial + Massage',
        payment: 200.00,
        update_reason: 'Client upgraded to combo service'
      };

      const result = await updateAppointment(testDb, testAppointment.id, updates);
      
      expect(result.message).toBe('Appointment updated successfully');

      // Verify all fields were updated
      const updatedAppointment = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM appointments WHERE id = ?', [testAppointment.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(updatedAppointment.category).toBe('Facial + Massage');
      expect(updatedAppointment.payment).toBe(200.00);
      expect(updatedAppointment.update_reason).toBe('Client upgraded to combo service');
    });

    it('should reject update with no fields', async () => {
      await expect(updateAppointment(testDb, testAppointment.id, {}))
        .rejects.toThrow('No fields to update');
    });

    it('should reject update for non-existent appointment', async () => {
      const updates = { category: 'Massage' };

      await expect(updateAppointment(testDb, 999, updates))
        .rejects.toThrow('Appointment not found');
    });

    it('should handle partial updates correctly', async () => {
      const updates = { category: 'Massage' };

      const result = await updateAppointment(testDb, testAppointment.id, updates);
      
      expect(result.message).toBe('Appointment updated successfully');

      // Verify only specified field was updated
      const updatedAppointment = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM appointments WHERE id = ?', [testAppointment.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(updatedAppointment.category).toBe('Massage');
      expect(updatedAppointment.payment).toBe(100.00); // Unchanged
      expect(updatedAppointment.update_reason).toBeNull(); // Unchanged
    });
  });

  describe('completeAppointment', () => {
    let testAppointment;

    beforeEach(async () => {
      // Create a test appointment first
      testAppointment = await createAppointment(testDb, {
        date: '2024-01-15',
        time: '14:00',
        client: 'John Doe',
        category: 'Facial',
        payment: 100.00
      });
    });

    it('should complete appointment with tip', async () => {
      const result = await completeAppointment(testDb, testAppointment.id, 15.00);
      
      expect(result.message).toBe('Appointment marked as completed');

      // Verify appointment was marked as completed
      const completedAppointment = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM appointments WHERE id = ?', [testAppointment.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(completedAppointment.status).toBe('completed');
      expect(completedAppointment.tip).toBe(15.00);
      expect(completedAppointment.updated_at).toBeDefined();
    });

    it('should complete appointment without tip', async () => {
      const result = await completeAppointment(testDb, testAppointment.id);
      
      expect(result.message).toBe('Appointment marked as completed');

      // Verify appointment was marked as completed
      const completedAppointment = await new Promise((resolve, reject) => {
        testDb.get('SELECT * FROM appointments WHERE id = ?', [testAppointment.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(completedAppointment.status).toBe('completed');
      expect(completedAppointment.tip).toBe(0);
    });

    it('should reject completion for non-existent appointment', async () => {
      await expect(completeAppointment(testDb, 999, 15.00))
        .rejects.toThrow('Appointment not found');
    });
  });

  describe('createExpense', () => {
    it('should create expense with category_id', async () => {
      const expenseData = {
        date: '2024-01-15',
        description: 'Cleaning supplies',
        amount: 45.50,
        category_id: 1
      };

      const result = await createExpense(testDb, expenseData);
      
      expect(result.id).toBeDefined();
      expect(result.message).toBe('Expense created successfully');
    });

    afterEach(async () => {
      // Clean up expenses after each test in this block
      await testDb.run('DELETE FROM expenses');
    });
  });

  describe('getAllExpenses', () => {
    beforeEach(async () => {
      // Create test expenses
      await createExpense(testDb, {
        date: '2024-01-15',
        description: 'Cleaning supplies',
        amount: 45.50,
        category_id: 1
      });

      await createExpense(testDb, {
        date: '2024-01-16',
        description: 'Equipment maintenance',
        amount: 75.00,
        category_id: 2
      });
    });

    afterEach(async () => {
      // Clean up expenses after each test in this block
      await testDb.run('DELETE FROM expenses');
    });

    it('should return all expenses with category metadata', async () => {
      const expenses = await getAllExpenses(testDb);
      
      expect(expenses).toHaveLength(2);
      
      // Verify expenses are ordered by date DESC
      expect(new Date(expenses[0].date).getTime()).toBeGreaterThan(new Date(expenses[1].date).getTime());
      
      // Check that both expenses exist (order doesn't matter for this test)
      const descriptions = expenses.map(e => e.description);
      expect(descriptions).toContain('Cleaning supplies');
      expect(descriptions).toContain('Equipment maintenance');
    });

    it('should handle database errors gracefully', async () => {
      // Pass invalid database object to trigger error
      await expect(getAllExpenses(null))
        .rejects.toThrow();
    });
  });
});

const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../backend/database/init');

// Create a test Express app
const app = express();
app.use(express.json());

// Mock the database for testing
jest.mock('../../backend/database/init', () => ({
  getDatabase: jest.fn()
}));

// Import the routes
const appointmentsRoutes = require('../../backend/routes/appointments');
const expensesRoutes = require('../../backend/routes/expenses');

// Mock the database instance
const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn()
};

// Setup the app with routes
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/expenses', expensesRoutes);

// Mock getDatabase to return our test database
getDatabase.mockReturnValue(mockDb);

describe('Appointment Management Integration', () => {
  let testAppointment;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default test appointment
    testAppointment = {
      id: 1,
      date: '2024-01-15',
      time: '14:00',
      client: 'John Doe',
      category: 'Facial',
      payment: 100.00,
      status: 'pending',
      update_reason: null,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    };

    // Mock successful database operations
    mockDb.run.mockImplementation(function(callback) {
      if (typeof callback === 'function') {
        callback(null);
      }
      return { changes: 1, lastID: 1 };
    });
  });

  describe('Full Edit Workflow via Chatbot', () => {
    it('should complete full edit workflow and persist update_reason', async () => {
      // 1. Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      // 2. Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      // 3. Simulate chatbot edit request (this is what the chatbot sends)
      const editData = {
        category: 'Massage',
        update_reason: 'Client requested change from facial to massage'
      };

      // 4. Call API directly (simulating what happens when chatbot calls it)
      const response = await request(app)
        .put('/api/appointments/1')
        .send(editData);

      // 5. Verify API response
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appointment updated successfully');

      // 6. Verify database was called with correct SQL including update_reason
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('update_reason = ?'),
        expect.arrayContaining(['Client requested change from facial to massage']),
        expect.any(Function)
      );

      // 7. Verify the SQL includes all necessary fields
      const sqlCall = mockDb.run.mock.calls[0][0];
      expect(sqlCall).toContain('category = ?');
      expect(sqlCall).toContain('payment = ?');
      expect(sqlCall).toContain('update_reason = ?');
      expect(sqlCall).toContain('updated_at = CURRENT_TIMESTAMP');
    });

    it('should handle category change with automatic payment update', async () => {
      // 1. Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      // 2. Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      // 3. Simulate chatbot edit request with category change only
      const editData = {
        category: 'Facial + Massage'
      };

      // 4. Call API
      const response = await request(app)
        .put('/api/appointments/1')
        .send(editData);

      // 5. Verify API response
      expect(response.status).toBe(200);

      // 6. Verify payment was auto-updated based on category change
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('payment = ?'),
        expect.arrayContaining([200.00]), // Auto-calculated price for Facial + Massage
        expect.any(Function)
      );

      // 7. Verify the SQL includes both category and payment updates
      const sqlCall = mockDb.run.mock.calls[0][0];
      expect(sqlCall).toContain('category = ?');
      expect(sqlCall).toContain('payment = ?');
    });
  });

  describe('Full Completion Workflow', () => {
    it('should complete appointment with tip collection', async () => {
      // 1. Mock database run for completion
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      // 2. Simulate completion request with tip
      const completionData = {
        tip: 15.00
      };

      // 3. Call completion API
      const response = await request(app)
        .patch('/api/appointments/1/complete')
        .send(completionData);

      // 4. Verify API response
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appointment marked as completed');

      // 5. Verify the SQL includes status update and tip
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('status = "completed"'),
        expect.arrayContaining([15.00, 1]),
        expect.any(Function)
      );
    });
  });

  describe('Full Cancellation Workflow', () => {
    it('should soft delete appointment with reason tracking', async () => {
      // 1. Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { ...testAppointment, status: 'pending' });
      });

      // 2. Mock database run for soft delete
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      // 3. Simulate cancellation request with reason
      const cancellationData = {
        update_reason: 'Client cancelled due to illness'
      };

      // 4. Call cancellation API
      const response = await request(app)
        .delete('/api/appointments/1')
        .send(cancellationData);

      // 5. Verify API response
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appointment cancelled successfully');

      // 6. Verify the SQL includes status update and reason
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('status = "cancelled"'),
        expect.arrayContaining(['Client cancelled due to illness', 1]),
        expect.any(Function)
      );
    });
  });

  describe('Expense Management Integration', () => {
    it('should create expense with category_id and return metadata', async () => {
      // 1. Mock database get to return existing category
      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('expense_categories')) {
          callback(null, { id: 1, name: 'Supplies', is_active: 1 });
        } else {
          callback(null, null);
        }
      });

      // 2. Mock database run for expense creation
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1, lastID: 1 };
      });

      // 3. Mock database all for expense retrieval
      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, [{
          id: 1,
          date: '2024-01-15',
          description: 'Cleaning supplies',
          amount: 45.50,
          category: 'Supplies',
          category_id: 1,
          category_name: 'Supplies',
          category_description: 'Cleaning products, spa materials',
          category_color: '#3B82F6'
        }]);
      });

      // 4. Create expense via API
      const expenseData = {
        date: '2024-01-15',
        description: 'Cleaning supplies',
        amount: 45.50,
        category_id: 1
      };

      const createResponse = await request(app)
        .post('/api/expenses')
        .send(expenseData);

      expect(createResponse.status).toBe(201);

      // 5. Retrieve expenses via API
      const getResponse = await request(app)
        .get('/api/expenses');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body[0].category_name).toBe('Supplies');
      expect(getResponse.body[0].category_color).toBe('#3B82F6');
    });
  });
});


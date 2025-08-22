const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../database/init');

// Create a test Express app
const app = express();
app.use(express.json());

// Mock the database for testing
jest.mock('../../database/init', () => ({
  getDatabase: jest.fn()
}));

// Import the expenses routes
const expensesRoutes = require('../expenses');

// Mock the database instance
const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn()
};

// Setup the app with routes
app.use('/api/expenses', expensesRoutes);

// Mock getDatabase to return our test database
getDatabase.mockReturnValue(mockDb);

describe('Expenses API', () => {
  let testExpense;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default test expense
    testExpense = {
      id: 1,
      date: '2024-01-15',
      description: 'Test expense',
      amount: 25.00,
      category_id: 1,
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

  describe('POST /api/expenses', () => {
    it('should create expense with category_id', async () => {
      // Mock database get to return existing category
      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('expense_categories')) {
          callback(null, { id: 1, name: 'Supplies', is_active: 1 });
        } else {
          callback(null, null);
        }
      });

      // Mock database run for expense creation
      mockDb.run.mockImplementation(function(sql, params, callback) {
        // Bind the context to simulate the 'this' object
        const context = { changes: 1, lastID: 1 };
        callback.call(context, null);
        return context;
      });

      const expenseData = {
        date: '2024-01-15',
        description: 'Cleaning supplies',
        amount: 45.50,
        category_id: 1
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.message).toBe('Expense created successfully');
    });



    it('should validate category_id exists and is active', async () => {
      // Mock database get to return no category
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const expenseData = {
        date: '2024-01-15',
        description: 'Test expense',
        amount: 25.00,
        category_id: 999
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData)
        .expect(400);

      expect(response.body.error).toBe('Invalid category_id provided');
    });

    it('should reject expense without category_id', async () => {
      const expenseData = {
        date: '2024-01-15',
        description: 'Test expense',
        amount: 25.00
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData)
        .expect(400);

      expect(response.body.error).toBe('Category ID is required and must be a positive integer');
    });

    it('should reject negative amounts', async () => {
      const expenseData = {
        date: '2024-01-15',
        description: 'Test expense',
        amount: -25.00,
        category_id: 1
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData)
        .expect(400);

      expect(response.body.error).toContain('positive number');
    });

    it('should reject empty description', async () => {
      const expenseData = {
        date: '2024-01-15',
        description: '',
        amount: 25.00,
        category_id: 1
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/expenses', () => {
    it('should return all expenses with category metadata', async () => {
      const mockExpenses = [
        {
          id: 1,
          date: '2024-01-15',
          description: 'Cleaning supplies',
          amount: 45.50,
          category_id: 1,
          category_name: 'Supplies',
          category_description: 'Cleaning products, spa materials',
          category_color: '#3B82F6'
        }
      ];

      // Mock database all to return expenses
      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, mockExpenses);
      });

      const response = await request(app)
        .get('/api/expenses')
        .expect(200);

      expect(response.body).toEqual(mockExpenses);
      expect(response.body[0].category_name).toBe('Supplies');
      expect(response.body[0].category_color).toBe('#3B82F6');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database all to return error
      mockDb.all.mockImplementation((sql, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/expenses')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch expenses');
    });
  });



  describe('PUT /api/expenses/:id', () => {
    it('should update expense with new category_id', async () => {
      // Mock database get to return existing expense
      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('expense_categories')) {
          callback(null, { id: 2, name: 'Equipment', is_active: 1 });
        } else {
          callback(null, testExpense);
        }
      });

      // Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const updateData = {
        description: 'Updated description',
        category_id: 2
      };

      const response = await request(app)
        .put('/api/expenses/1')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Expense updated successfully');
    });

    it('should validate new category_id exists', async () => {
      // Mock database get to return no category
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const updateData = {
        category_id: 999
      };

      const response = await request(app)
        .put('/api/expenses/1')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Invalid category_id provided');
    });
  });
});

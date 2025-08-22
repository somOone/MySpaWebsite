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

// Import the appointments routes
const appointmentsRoutes = require('../appointments');

// Mock the database instance
const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn()
};

// Setup the app with routes
app.use('/api/appointments', appointmentsRoutes);

// Mock getDatabase to return our test database
getDatabase.mockReturnValue(mockDb);

describe('Appointments API', () => {
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

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment with all fields including update_reason', async () => {
      // Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      // Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const updateData = {
        category: 'Massage',
        payment: 120.00,
        update_reason: 'Client requested change from facial to massage'
      };

      const response = await request(app)
        .put('/api/appointments/1')
        .send(updateData)
        .expect(200);

      // Verify response
      expect(response.body.message).toBe('Appointment updated successfully');

      // Verify database was called with correct SQL including update_reason
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('update_reason = ?'),
        expect.arrayContaining(['Client requested change from facial to massage']),
        expect.any(Function)
      );
    });

    it('should accept valid category values', async () => {
      // Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      // Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const response = await request(app)
        .put('/api/appointments/1')
        .send({ category: 'Facial + Massage' })
        .expect(200);

      expect(response.body.message).toBe('Appointment updated successfully');
    });

    it('should accept valid payment amounts', async () => {
      // Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      // Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const response = await request(app)
        .put('/api/appointments/1')
        .send({ payment: 150.00 })
        .expect(200);

      expect(response.body.message).toBe('Appointment updated successfully');
    });

    it('should handle partial updates correctly', async () => {
      // Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      // Mock database run for update
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const response = await request(app)
        .put('/api/appointments/1')
        .send({ category: 'Facial + Massage' })
        .expect(200);

      // Verify payment was auto-updated based on category change
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('payment = ?'),
        expect.arrayContaining([200.00]), // Auto-calculated price for Facial + Massage
        expect.any(Function)
      );
    });

    it('should return 404 for non-existent appointment', async () => {
      // Mock database get to return no appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .put('/api/appointments/999')
        .send({ category: 'Massage' })
        .expect(404);

      expect(response.body.error).toBe('Appointment not found');
    });

    it('should return 400 when no fields to update', async () => {
      // Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, testAppointment);
      });

      const response = await request(app)
        .put('/api/appointments/1')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('No fields to update');
    });
  });

  describe('PATCH /api/appointments/:id/complete', () => {
    it('should complete appointment with tip', async () => {
      // Mock database run for completion
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const response = await request(app)
        .patch('/api/appointments/1/complete')
        .send({ tip: 15.00 })
        .expect(200);

      expect(response.body.message).toBe('Appointment marked as completed');

      // Verify the SQL includes status update and tip
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('status = "completed"'),
        expect.arrayContaining([15.00, "1"]),
        expect.any(Function)
      );
    });

    it('should return 404 for non-existent appointment', async () => {
      // Mock database run to return no changes
      mockDb.run.mockImplementation(function(sql, params, callback) {
        // Simulate no rows affected by binding this.changes = 0
        const mockThis = { changes: 0 };
        callback.call(mockThis, null);
        return mockThis;
      });

      const response = await request(app)
        .patch('/api/appointments/999/complete')
        .send({ tip: 15.00 })
        .expect(404);

      expect(response.body.error).toBe('Appointment not found');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should soft delete appointment with reason', async () => {
      // Mock database get to return existing appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { ...testAppointment, status: 'pending' });
      });

      // Mock database run for soft delete
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback(null);
        return { changes: 1 };
      });

      const response = await request(app)
        .delete('/api/appointments/1')
        .send({ update_reason: 'Client cancelled due to illness' })
        .expect(200);

      expect(response.body.message).toBe('Appointment cancelled successfully');

      // Verify the SQL includes status update and reason
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("status = 'cancelled'"),
        expect.arrayContaining(['Client cancelled due to illness', "1"]),
        expect.any(Function)
      );
    });

    it('should return 400 for completed appointments', async () => {
      // Mock database get to return completed appointment
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { ...testAppointment, status: 'completed' });
      });

      const response = await request(app)
        .delete('/api/appointments/1')
        .send({ update_reason: 'Test' })
        .expect(400);

      expect(response.body.error).toBe('Cannot cancel completed appointments');
    });
  });
});

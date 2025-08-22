// Integration test setup
// This file runs before all integration tests

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(15000);

// Global test utilities
global.testUtils = {
  // Helper to create test data
  createTestData: () => {
    return {
      appointment: {
        date: '2024-01-15',
        time: '14:00',
        client: 'Test Client',
        category: 'Facial',
        payment: 100.00
      },
      expense: {
        date: '2024-01-15',
        description: 'Test expense',
        amount: 25.00,
        category: 'Supplies'
      }
    };
  },

  // Helper to validate API responses
  validateApiResponse: (response, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
    return response.body;
  },

  // Helper to validate database state
  validateDatabaseState: async (db, table, id, expectedData) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else {
          Object.keys(expectedData).forEach(key => {
            expect(row[key]).toEqual(expectedData[key]);
          });
          resolve(row);
        }
      });
    });
  }
};

// Cleanup after all tests
afterAll(async () => {
  // Add any global cleanup here
  console.log('🧹 Integration tests completed, cleaning up...');
});


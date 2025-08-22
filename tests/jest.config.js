module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/**/*.test.js'
  ],
  collectCoverageFrom: [
    'backend/**/*.js',
    'frontend/src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 15000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/setup.js']
};


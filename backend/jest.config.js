module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx}'
  ],
  collectCoverageFrom: [
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 10000,
  verbose: true
};


// jest.config.js
module.exports = {
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/*.test.js'],
  globalSetup: './jest.setup.js',
  globalTeardown: './jest.teardown.js',
  globals: {
    MONGO_CLIENT: null,
  },
  // setupFilesAfterEnv: ['./jest.setup.js'],
};

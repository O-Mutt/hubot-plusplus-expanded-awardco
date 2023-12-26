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
    MONGOD: null,
  },
  // setupFilesAfterEnv: ['./jest.setup.js'],
};

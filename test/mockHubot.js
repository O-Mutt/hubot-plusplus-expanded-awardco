module.exports = {
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  name: 'jestbot',
  on: jest.fn(),
  respond: jest.fn(),
  messageRoom: jest.fn(),
  emit: jest.fn(),
  loadFile: jest.fn(),
};

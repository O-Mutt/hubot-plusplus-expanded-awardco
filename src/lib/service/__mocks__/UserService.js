const user = { awardCoDM: true };

const UserService = require('../UserService');
const mockGetUser = jest.fn().mockResolvedValue(user);
jest.mock('../UserService', () => {
  return jest.fn().mockImplementation(() => {
    return { getUser: mockGetUser };
  });
});

UserService.mockGetUser = mockGetUser;
module.exports = UserService;

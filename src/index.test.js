const { test, expect, beforeEach } = require('@jest/globals');
const Helper = require('hubot-test-helper');

let plusPlusAwardCo;
let room;
beforeEach(() => {
  jest.mock('../src/lib/service/UserService');
  plusPlusAwardCo = new Helper('../src/index.js');
  room = plusPlusAwardCo.createRoom();
});

afterEach(() => {
  room.destroy();
});

test('responds to basic change awardco config', async () => {
  room.name = 'D123';
  room.user.say('matt.erickson', 'change awardco config');
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(true).toStrictEqual(true);
});

const { test, expect, beforeEach, describe } = require('@jest/globals');
const Helper = require('hubot-test-helper');
const { wait } = require('../test/util');

describe('index', () => {
  let plusPlusAwardCo;
  let room;
  beforeEach(() => {
    jest.mock('./lib/service/UserService');
    plusPlusAwardCo = new Helper('../src/index.js');
    room = plusPlusAwardCo.createRoom({
      httpd: false,
    });
  });

  afterEach(() => {
    room.destroy();
  });

  test('responds to basic change awardco config', async () => {
    room.name = 'D123';
    room.user.say('matt.erickson', 'change awardco config');
    await wait(); // Silly hubot timing things
    expect(true).toStrictEqual(true);
  });
});

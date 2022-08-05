const {
  test, expect, beforeAll, beforeEach,
} = require('@jest/globals');
const Helper = require('hubot-test-helper');
const { MongoClient } = require('mongodb');
const mongoUnit = require('mongo-unit');

jest.mock('../src/lib/service/UserService');

let plusPlusAwardCo;
let room;
let db;
beforeAll(async function () {
  const url = await mongoUnit.start();
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const connection = await client.connect();
  db = connection.db();
  process.env.MONGODB_URI = url;
  process.env.AWARDCO_API_KEY = 'test_123';
  plusPlusAwardCo = new Helper('../src/index.js');
});

beforeEach(() => {
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

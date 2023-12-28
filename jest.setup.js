const { MongoClient } = require('mongodb');
const mongoUnit = require('mongo-unit');
const { wait } = require('./test/util');

module.exports = async (globalConfig) => {
  const orgTimeout = globalConfig.testTimeout;
  globalConfig.testTimeout = 500000;
  const url = await mongoUnit.start({
    version: '6.0.12',
    port: Math.floor(Math.random() * 10000) + 10000,
  });

  await wait(1000);
  console.log('$$$$$$', url, ' ==== ', mongoUnit.getUrl());

  const client = new MongoClient(mongoUnit.getUrl(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const connection = await client.connect();
  connection.db();
  process.env.MONGO_URI = mongoUnit.getUrl();
  process.env.AWARDCO_API_KEY = 'test_123';

  // Set reference to mongod in order to close the server during teardown.
  globalThis.MONGO_CLIENT = client;

  globalConfig.testTimeout = orgTimeout;
};

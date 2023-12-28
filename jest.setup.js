const { MongoClient } = require('mongodb');
const mongoUnit = require('mongo-unit');
const { wait } = require('./test/util');

module.exports = async (globalConfig) => {
  const orgTimeout = globalConfig.testTimeout;
  globalConfig.testTimeout = 100000;
  const url = await mongoUnit.start({
    version: '6.0.9',
    port: Math.floor(Math.random() * 10000) + 10000,
  });

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const connection = await client.connect();
  const db = connection.db();
  process.env.MONGODB_URI = url;
  process.env.AWARDCO_API_KEY = 'test_123';

  // Set reference to mongod in order to close the server during teardown.
  globalThis.MONGOD = db;

  globalConfig.testTimeout = orgTimeout;
};

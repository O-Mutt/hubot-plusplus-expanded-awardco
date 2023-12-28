const { MongoClient } = require('mongodb');
const mongoUnit = require('mongo-unit');
const { wait } = require('./test/util');

module.exports = async (globalConfig) => {
  const orgTimeout = globalConfig.testTimeout;
  globalConfig.testTimeout = 100000;
  await mongoUnit.start({
    version: '6.0.12',
    port: Math.floor(Math.random() * 10000) + 10000,
  });

  process.env.MONGO_URI = mongoUnit.getUrl();
  process.env.AWARDCO_API_KEY = 'test_123';

  globalConfig.testTimeout = orgTimeout;
};

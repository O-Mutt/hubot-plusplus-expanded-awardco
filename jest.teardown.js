const mongoUnit = require('mongo-unit');

module.exports = async () => {
  console.log('Tearing down unit testing');
  await mongoUnit.stop();
  console.log('Torn down');
};

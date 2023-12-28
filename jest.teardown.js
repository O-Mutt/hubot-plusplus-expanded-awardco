const mongoUnit = require('mongo-unit');

module.exports = async () => {
  console.log('Tearing down unit testing');
  try {
    await mongoUnit.stop();
  } catch (e) {}
  console.log('Torn down');
};

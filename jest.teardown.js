module.exports = async () => {
  console.log('Tearing down mongo_unit');
  await globalThis.MONGO_CLIENT.close();
  // await globalThis.MONGOD.stop();
};

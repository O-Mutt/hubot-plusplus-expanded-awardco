const { MongoClient } = require('mongodb');
const H = require('../helpers');

class UserService {
  static db;

  static async init() {
    const { mongoUri } = H.createProcVars();
    const client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const connection = await client.connect();
    UserService.db = connection.db();
  }

  static async getDb() {
    if (!UserService.db) {
      await UserService.init();
    }
    return UserService.db;
  }

  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  static async getUser(slackId) {
    const db = await UserService.getDb();

    const dbUser = await db
      .collection('scores')
      .findOne({ slackId }, { sort: { score: -1 } });

    return dbUser;
  }

  static async setAwardCoResponse(user, response) {
    const db = await UserService.getDb();

    await db
      .collection('scores')
      .updateOne(
        { slackId: user.slackId },
        { $set: { awardCoResponse: response } },
        { sort: { score: -1 } },
      );
  }

  static async setAwardCoAmount(user, amount) {
    const db = await UserService.getDb();

    await db
      .collection('scores')
      .updateOne(
        { slackId: user.slackId },
        { $set: { awardCoAmount: amount } },
        { sort: { score: -1 } },
      );
  }

  static async toggleAwardCoDM(user) {
    const db = await UserService.getDb();

    const shouldDM = user.awardCoDM ? !user.awardCoDM : false;
    await db
      .collection('scores')
      .updateOne(
        { slackId: user.slackId },
        { $set: { awardCoDM: shouldDM } },
        { sort: { score: -1 } },
      );
  }
}

module.exports = UserService;
module.exports.us = UserService;

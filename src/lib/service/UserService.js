const { MongoClient } = require('mongodb');
const Helpers = require('../helpers');

class UserService {
  constructor(robot) {
    const procVars = Helpers.createProcVars(robot.name);

    this.db = undefined;
    this.robot = robot;
    this.uri = procVars.mongoUri;
    this.init(); // this is async but should kick off the connection
  }

  async init() {
    const client = new MongoClient(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const connection = await client.connect();
    this.db = connection.db();
  }

  async getDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  async getUser(slackId) {
    const db = await this.getDb();

    const dbUser = await db
      .collection('scores')
      .findOne({ slackId }, { sort: { score: -1 } });

    return dbUser;
  }

  async setAwardCoResponse(user, response) {
    const db = await this.getDb();

    await db
      .collection('scores')
      .updateOne(
        { slackId: user.slackId },
        { $set: { awardCoResponse: response } },
        { sort: { score: -1 } }
      );
  }

  async setAwardCoAmount(user, amount) {
    const db = await this.getDb();

    await db
      .collection('scores')
      .updateOne(
        { slackId: user.slackId },
        { $set: { awardCoAmount: amount } },
        { sort: { score: -1 } }
      );
  }

  async toggleAwardCoDM(user) {
    const db = await this.getDb();

    const shouldDM = user.awardCoDM ? !user.awardCoDM : false;
    await db
      .collection('scores')
      .updateOne(
        { slackId: user.slackId },
        { $set: { awardCoDM: shouldDM } },
        { sort: { score: -1 } }
      );
  }
}

module.exports = UserService;

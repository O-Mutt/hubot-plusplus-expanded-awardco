const Axios = require('axios');

class AwardCoService {
  constructor(robot, procVars) {
    this.robot = robot;
    this.apiKey = procVars.awardCoApiKey;
    this.url = procVars.awardCoUri;
    this.axios = Axios.create({
      baseURL: procVars.awardCoUri,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.defaultNote = procVars.awardCoDefaultNote || `${procVars.awardCoName} given through ${this.robot.name}`;
  }

  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  async sendAward(event) {
    this.robot.logger.debug(`Sending a award co award to ${JSON.stringify(event.recipient.slackEmail)} from ${JSON.stringify(event.sender.slackEmail)}`);
    let note = this.defaultNote;
    if (event.reason) {
      const buff = new Buffer.from(event.reason, 'base64');
      note = buff.toString('UTF-8') + " (via ${this.robot.name})";
    }

    let data;
    try {
      ({ data } = await this.axios.post('/reward', {
        apiKey: this.apiKey,
        email: event.recipient.slackEmail,
        rewardedBy: event.sender.slackEmail,
        // amount: event.amount, // this is used for $ cash dollars and is not currently supported due to lack of `/budget` endpoint
        note,
      }));
    } catch (e) {
      this.robot.logger.error('Error sending awardCo award', e);
      data = e.response.data;
    }

    return data;
  }
}

module.exports = AwardCoService;

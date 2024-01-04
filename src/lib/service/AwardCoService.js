const Axios = require('axios');
const Helpers = require('../helpers');

class AwardCoService {
  constructor(robot) {
    const procVars = Helpers.createProcVars(robot.name);
    this.robot = robot;
    this.apiKey = procVars.awardCoApiKey;
    this.url = procVars.awardCoUri;
    this.axios = Axios.create({
      baseURL: procVars.awardCoUri,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.defaultNote =
      procVars.awardCoDefaultNote ||
      `${procVars.awardCoName} given through ${this.robot.name}`;
  }

  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  async sendAwards(events) {
    const promises = [];
    events.forEach((event) => {
      this.robot.logger.debug(
        `Sending a award co award to ${JSON.stringify(
          event.recipient.slackEmail,
        )} from ${JSON.stringify(event.sender.slackEmail)}`,
      );
      let note = this.defaultNote;
      if (event.reason) {
        const buff = Buffer.from(event.reason, 'base64');
        note = `${buff.toString('UTF-8')} (via ${this.robot.name})`;
      }

      promises.push(
        this.axios.post('/reward', {
          apiKey: this.apiKey,
          email: event.recipient.slackEmail,
          rewardedBy: event.sender.slackEmail,
          // amount: event.amount,   // this is used for $ cash dollars and is not currently supported due to lack of `/budget` endpoint
          note,
        }),
      );
    });

    const responses = [];
    const results = await Promise.allSettled(promises);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        responses.push({
          response: result.value.data,
          event: events[i],
        });
      } else {
        this.robot.logger.error(
          'Error sending awardCo award',
          result.reason.response.data,
        );
        responses.push({
          response: result.reason.response.data,
          event: events[i],
        });
      }
    }
    return responses;
  }
}

module.exports = AwardCoService;

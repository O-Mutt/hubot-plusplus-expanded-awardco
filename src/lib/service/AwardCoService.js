const Axios = require('axios');
const H = require('../helpers');

class AwardCoService {
  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  static async sendAwards(robot, events) {
    const { robotName, awardCoApiKey, awardCoUri, awardCoDefaultNote } =
      H.createProcVars(robot.name);
    const axiosInstance = Axios.create({
      baseURL: awardCoUri,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const promises = [];
    events.forEach((event) => {
      robot.logger.debug(
        `Sending a award co award to ${JSON.stringify(
          event.recipient.slackEmail,
        )} from ${JSON.stringify(event.sender.slackEmail)}`,
      );
      let note = awardCoDefaultNote;
      if (event.reason) {
        const buff = Buffer.from(event.reason, 'base64');
        note = `${buff.toString('UTF-8')} (via ${robotName})`;
      }

      promises.push(
        axiosInstance.post('/reward', {
          apiKey: awardCoApiKey,
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
        robot.logger.error(
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
module.exports.acs = AwardCoService;

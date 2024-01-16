const H = require('./helpers');
const { us } = require('./service/UserService');

class AwardCoMessageHandler {
  static async handleAwardCoSent(robot, awardResponses) {
    const { awardCoName } = H.createProcVars(robot.name);
    const messages = [];
    awardResponses.forEach(async (ar) => {
      if (ar.response.success === true) {
        robot.logger.debug('awardCo point was sent and we caught the event.');
        messages.push(
          `We sent a(n) ${awardCoName} to <@${ar.event.recipient.slackId}>.`,
        );
        const user = await us.getUser(ar.event.sender.slackId);
        if (user.awardCoDM === true || user.awardCoDM === undefined) {
          let dm = `We sent <@${ar.event.recipient.slackId}> an award via ${awardCoName}.`;
          /* if ((!user.awardCoAmount || e.event.amount === 1) && Helpers.rngBoolean()) {
          dm += `\n\nDid you know you could change the amount you send per ${robot.name} Point?\n Just DM @${robot.name} \`change my ${awardCoName} points setting\`,`;
          dm += '\nI will ask you about how many points you\'d like to send per `++` you respond with a number.\n :tada: Bingo Bango Bongo, you\'re all set.';
        } */
          if (user.awardCoDM === undefined && H.rngBoolean()) {
            dm += `\n\nDon't like these DMs about ${awardCoName}?\nJust DM @${robot.name} \`toggle dm about ${awardCoName}\` and we will turn off this DM.`;
          }
          robot.messageRoom(ar.event.sender.slackId, dm);
        }
      } else {
        robot.logger.error('there was an issue sending a award', ar.response);
        messages.push(
          `Sorry, there was an issue sending your ${awardCoName} award to <@${ar.event.recipient.slackId}>: ${ar.response.message}`,
        );
      }
    });

    robot.emit('plus-plus-reaction', {
      reactions: ['oktapreciate', 'bufo-offers-oktappreciate', 'hubot'],
      silent: awardResponses[0].silent,
      msg: awardResponses[0].event.msg,
    });
    if (!awardResponses[0].silent) {
      awardResponses[0].event.msg.send(messages.join('\n'));
    }
  }
}

module.exports = AwardCoMessageHandler;
module.exports.acmh = AwardCoMessageHandler;

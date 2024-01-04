const Helpers = require('./helpers');
const UserService = require('./service/UserService');

class AwardCoMessageHandler {
  constructor(robot) {
    const procVars = Helpers.createProcVars(robot.name);

    this.robot = robot;
    this.awardName = procVars.awardCoName;
    this.userService = new UserService(robot);
  }

  async handleAwardCoSent(awardResponses) {
    const messages = [];
    awardResponses.forEach(async (ar) => {
      if (ar.response.success === true) {
        this.robot.logger.debug(
          'awardCo point was sent and we caught the event.',
        );
        messages.push(
          `We sent a(n) ${this.awardName} to <@${ar.event.recipient.slackId}>.`,
        );
        const user = await this.userService.getUser(ar.event.sender.slackId);
        if (user.awardCoDM === true || user.awardCoDM === undefined) {
          let dm = `We sent <@${ar.event.recipient.slackId}> an award via ${this.awardName}.`;
          /* if ((!user.awardCoAmount || e.event.amount === 1) && Helpers.rngBoolean()) {
          dm += `\n\nDid you know you could change the amount you send per ${robot.name} Point?\n Just DM @${robot.name} \`change my ${this.awardName} points setting\`,`;
          dm += '\nI will ask you about how many points you\'d like to send per `++` you respond with a number.\n :tada: Bingo Bango Bongo, you\'re all set.';
        } */
          if (user.awardCoDM === undefined && Helpers.rngBoolean()) {
            dm += `\n\nDon't like these DMs about ${this.awardName}?\nJust DM @${this.robot.name} \`toggle dm about ${this.awardName}\` and we will turn off this DM.`;
          }
          this.robot.messageRoom(ar.event.sender.slackId, dm);
        }
      } else {
        this.robot.logger.error(
          'there was an issue sending a award',
          ar.response,
        );
        messages.push(
          `Sorry, there was an issue sending your ${this.awardName} award to <@${ar.event.recipient.slackId}>: ${ar.response.message}`,
        );
      }
    });
    awardResponses[0].event.msg.send(messages.join('\n'));
  }
}

module.exports = AwardCoMessageHandler;

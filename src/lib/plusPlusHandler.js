const Conversation = require('hubot-conversation');
const H = require('./helpers');
const { acs } = require('./service/AwardCoService');
const { AwardCoResponse } = require('./service/AwardCoResponseEnum');
const { us } = require('./service/UserService');

class PlusPlusMessageHandler {
  /**
   * The event that was emitted by the plus-plus module for a user
   * (https://github.com/O-Mutt/hubot-plusplus-expanded/blob/main/src/plusplus.js#L270-L277)
   * @param {array} events the base array of objects
   * @param {string} events[].notificationMessage the string that represents the event
   * @param {object} events[].sender the sender (from) of the point
   * @param {object} events[].recipient the recipient (to) of the point
   * @param {string} events[].direction the direction of the point (e.g. '++' or '--')
   * @param {string} events[].room the room the point was sent in
   * @param {string} events[].cleanReason the clean (and encoded) reason for the point was sent
   * @param {object} events[].msg the msg from hubot that the event originated from
   * @returns
   */
  static async handlePlusPlus(robot, events) {
    const { robotName, awardName } = H.createProcVars(robot.name);
    const firstEvent = events[0];
    const { sender } = firstEvent;
    const switchBoard = new Conversation(robot);
    if (!['++', '+'].includes(firstEvent.direction)) {
      robot.logger.debug(
        `Points were taken away, not given. We won't talk to ${awardName} for this one.\n${JSON.stringify(
          firstEvent.direction,
        )}`,
      );
      return;
    }

    if (!sender.slackEmail) {
      robot.emit('plus-plus-failure', {
        notificationMessage: `${sender.name} is missing their slack email in ${robotName}. The message was sent in <#${firstEvent.room}>`,
        room: firstEvent.room,
      });
      return;
    }

    const ineligibleRecipients = events.filter((e) => !e.recipient.slackEmail);
    if (ineligibleRecipients.length > 0) {
      const message = `The following recipients are missing their slack email in ${robotName}: <@${ineligibleRecipients
        .map((ir) => ir.slackId ?? ir.name)
        .join('>, <@')}>. The message was sent in <#${firstEvent.room}>`;
      robot.logger.error(message);
      robot.emit('plus-plus-failure', {
        notificationMessage: `${message} in <#${firstEvent.room}>`,
        room: firstEvent.room,
      });
    }

    const eligibleRecipients = events
      .filter((e) => e.recipient.slackEmail)
      .map((e) => e.recipient);
    const eligibleRecipientsSlackTagString = `<@${eligibleRecipients
      .map((er) => er.slackId ?? er.name)
      .join('>, <@')}>`;
    const { awardCoAmount = 1 } = await us.getUser(robot, sender.slackId);
    events.forEach((e) => {
      e.amount = awardCoAmount;
    });

    const msg = {
      message: {
        user: {
          id: sender.slackId,
        },
      },
    };

    if (!events.sender.awardCoResponse) {
      const dialog = switchBoard.startDialog(msg);
      dialog.dialogTimeout = () => {
        robot.messageRoom(
          events.sender.slackId,
          "We didn't receive your response in time. Please try again.",
        );
      };
      // check with user how they want to handle hubot points/awardCo awards
      const choiceMsg = `${robotName} is setup to allow you to also send a(n) ${awardName} point when you send a ${robotName} point! \n
There are three options how you can setup ${robotName} to do this:\n
• Always send a(n) ${awardName} when you send a ${robotName} point.\n
• Prompt every time to send a ${robotName} point to include a(n) ${awardName} point.\n
• Never include a(n) ${awardName} point with ${robotName} points.\n\n

How would you like to configure ${robotName}? (You can always change this later by DMing me \`change my ${awardName} settings\`)\n
[ \`Always\` | \`Prompt\` | \`Never\` ]`;
      robot.messageRoom(sender.slackId, choiceMsg);
      dialog.addChoice(/always/i, async () => {
        await us.setAwardCoResponse(events.sender, AwardCoResponse.ALWAYS);
        PlusPlusMessageHandler.sendAwards(robot, events);
      });
      dialog.addChoice(/prompt/i, async () => {
        await us.setAwardCoResponse(events.sender, AwardCoResponse.PROMPT);
        robot.messageRoom(
          events.sender.slackId,
          `In that case, do you want to send ${eligibleRecipientsSlackTagString} a(n) ${awardName} worth ${events.amount}?\n[ \`Yes\` | \`No\` ]`,
        );
        dialog.addChoice(/yes/i, async () => {
          PlusPlusMessageHandler.sendAwards(robot, events);
        });
        dialog.addChoice(/no/i, async () => {
          robot.messageRoom(sender.slackId, 'Ah, alright. Next time!');
        });
      });
      dialog.addChoice(/never/i, async () => {
        await us.setAwardCoResponse(sender, AwardCoResponse.NEVER);
        robot.messageRoom(
          sender.slackId,
          'Alright! No worries. If you ever change your mind we can change your mind just let me know (DM me `change my awardCo settings`)!',
        );
      });
      return;
    }

    switch (sender.awardCoResponse) {
      case AwardCoResponse.ALWAYS:
        PlusPlusMessageHandler.sendAwards(robot, events);
        break;
      case AwardCoResponse.PROMPT: {
        const dialog = switchBoard.startDialog(msg);
        dialog.dialogTimeout = () => {
          robot.messageRoom(
            sender.slackId,
            "We didn't receive your response in time. Please try again.",
          );
        };
        robot.messageRoom(
          sender.slackId,
          `You just gave ${eligibleRecipientsSlackTagString} a ${robotName} point and ${awardName} is enabled, would you like to send them ${firstEvent.amount} point(s) on ${awardName} as well?\n[ \`Yes\` | \`No\` ]`,
        );
        dialog.addChoice(/yes/i, async () => {
          PlusPlusMessageHandler.sendAwards(robot, events);
        });
        dialog.addChoice(/no/i, () => {
          robot.messageRoom(sender.slackId, 'Ah, alright. Next time!');
        });
        break;
      }
      case AwardCoResponse.NEVER:
      default:
        break;
    }
  }

  /**
   * helper to send a list of events
   * @private
   */
  static async sendAwards(robot, events) {
    const awardResponses = await acs.sendAwards(robot, events);
    robot.emit('plus-plus-awardCo-sent', awardResponses);
  }
}

module.exports = PlusPlusMessageHandler;
module.exports.ppmh = PlusPlusMessageHandler;

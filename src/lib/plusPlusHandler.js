const Helpers = require('./helpers');

class PlusPlusMessageHandler {
  robot;
  awardCoService;
  awardName;
  constructor(robot) {
    const procVars = Helpers.createProcVars(robot.name);

    this.robot = robot;
    this.awardName = procVars.awardCoName;
    this.awardCoService = new AwardCoService(robot);
  }
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
  async handlePlusPlus(events) {
    const switchBoard = new Conversation(robot);
    if (!['++', '+'].includes(events.direction)) {
      this.robot.logger.debug(
        `Points were taken away, not given. We won't talk to ${
          this.awardName
        } for this one.\n${JSON.stringify(events.direction)}`
      );
      return;
    }

    if (!events.sender.slackEmail || !events.recipient.slackEmail) {
      const message = `<@${events.sender.slackId}> is trying to send to <@${events.recipient.slackId}> but the one of the emails are missing. Sender: [${events.sender.slackEmail}], Recipient: [${events.recipient.slackEmail}]`;
      this.robot.logger.error(message);
      this.robot.emit('plus-plus-failure', {
        notificationMessage: `${message} in <#${events.room}>`,
        room: events.room,
      });
      return;
    }

    const { awardCoAmount = 1 } = await userService.getUser(
      events.sender.slackId
    );
    events.amount = awardCoAmount;
    const msg = {
      message: {
        user: {
          id: events.sender.slackId,
        },
      },
    };

    if (!events.sender.awardCoResponse) {
      const dialog = switchBoard.startDialog(msg);
      dialog.dialogTimeout = () => {
        this.robot.messageRoom(
          events.sender.slackId,
          "We didn't receive your response in time. Please try again."
        );
      };
      // check with user how they want to handle hubot points/awardCo awards
      let choiceMsg = `${this.robot.name} is setup to allow you to also send a(n) ${this.awardName} point when you send a ${robot.name} point! `;
      choiceMsg += `There are three options how you can setup ${this.robot.name} to do this:`;
      choiceMsg += `\n• Always send a(n) ${this.awardName} when you send a ${this.robot.name} point.\n • Prompt every time to send a ${robot.name} point to include a(n) ${this.awardName} point.\n • Never include a(n) ${this.awardName} point with ${robot.name} points.`;
      choiceMsg += `\n\nHow would you like to configure ${this.robot.name}? (You can always change this later by DMing me \`change my ${this.awardName} settings\`)\n[ \`Always\` | \`Prompt\` | \`Never\` ]`;
      this.robot.messageRoom(events.sender.slackId, choiceMsg);
      dialog.addChoice(/always/i, async () => {
        await userService.setAwardCoResponse(
          events.sender,
          AwardCoResponse.ALWAYS
        );
        this.__sendAwards(events);
      });
      dialog.addChoice(/prompt/i, async () => {
        await userService.setAwardCoResponse(
          events.sender,
          AwardCoResponse.PROMPT
        );
        this.robot.messageRoom(
          events.sender.slackId,
          `In that case, do you want to send <@${events
            .map((e) => e.recipient.slackId)
            .join('>, <@')}> a(n) ${this.awardName} worth ${
            events.amount
          }?\n[ \`Yes\` | \`No\` ]`
        );
        dialog.addChoice(/yes/i, async () => {
          this.__sendAwards(events);
        });
        dialog.addChoice(/no/i, async () => {
          this.robot.messageRoom(
            events.sender.slackId,
            'Ah, alright. Next time!'
          );
        });
      });
      dialog.addChoice(/never/i, async () => {
        await userService.setAwardCoResponse(
          events.sender,
          AwardCoResponse.NEVER
        );
        this.robot.messageRoom(
          events.sender.slackId,
          'Alright! No worries. If you ever change your mind we can change your mind just let me know (DM me `change my awardCo settings`)!'
        );
      });
      return;
    }

    switch (events.sender.awardCoResponse) {
      case AwardCoResponse.ALWAYS:
        this.__sendAwards(events);
        break;
      case AwardCoResponse.PROMPT:
        const dialog = switchBoard.startDialog(msg);
        dialog.dialogTimeout = () => {
          this.robot.messageRoom(
            events.sender.slackId,
            "We didn't receive your response in time. Please try again."
          );
        };
        this.robot.messageRoom(
          events.sender.slackId,
          `You just gave <@${events.recipient.slackId}> a ${this.robot.name} point and ${this.awardName} is enabled, would you like to send them ${events.amount} point(s) on ${this.awardName} as well?\n[ \`Yes\` | \`No\` ]`
        );
        dialog.addChoice(/yes/i, async () => {
          this.__sendAwards(events);
        });
        dialog.addChoice(/no/i, () => {
          this.robot.messageRoom(
            events.sender.slackId,
            'Ah, alright. Next time!'
          );
        });
        break;
      case AwardCoResponse.NEVER:
      default:
        break;
    }
  }

  async __sendAwards(events) {
    const awardResponses = await this.awardCoService.sendAwards(events);
    this.robot.emit('plus-plus-awardCo-sent', awardResponses);
  }
}

module.exports = PlusPlusMessageHandler;

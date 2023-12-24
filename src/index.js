// Description:
//   Integration point between hubot-plusplus-expanded and awardco api
//
//
// Configuration:
//   MONGO_URI: URI for the mongo database
//   AWARDCO_API_KEY: Api key for connecting to the awardco api
//
// Commands:
//   change my awardCo configuration - used to change the config on when awardCo points are sent after a
//     hubot point
// Event-Listener:
//   plus-plus - Listens for this to send points
//
// Author: O-Mutt

const Conversation = require('hubot-conversation');

const { AwardCoResponse } = require('./lib/service/AwardCoResponseEnum');
const UserService = require('./lib/service/UserService');
const AwardCoService = require('./lib/service/AwardCoService');
const Helpers = require('./lib/helpers');

module.exports = function (robot) {
  const procVars = Helpers.createProcVars(process.env);

  const userService = new UserService(robot, procVars);
  const awardCoService = new AwardCoService(robot, procVars);

  const awardName = procVars.awardCoName;
  if (!procVars.awardCoApiKey) {
    robot.logger.error(
      'hubot-plusplus-expanded-awardCo is installed but the awardCo api key is not configured',
    );
    return;
  }

  robot.on('plus-plus', handlePlusPlus);
  robot.on('plus-plus-awardCo-sent', handleAwardCoSent);
  const changeSettingsRegExp = new RegExp(
    `.*change.*${awardName}\\s?(?:integration)?\\s?(?:configuration|config|response|setting|settings).*`,
    'ig',
  );
  const dmSettingRegExp = new RegExp(`.*toggle dm about ${awardName}.*`, 'ig');
  robot.respond(changeSettingsRegExp, changeAwardCoConfig);
  // robot.respond(/.*change.*awardCo.*(points|amount).*/ig, changeAwardCoAmount);
  robot.respond(dmSettingRegExp, toggleAwardCoDM);

  async function changeAwardCoConfig(msg) {
    const switchBoard = new Conversation(robot);
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${robot.name} in DM.`);
      return;
    }

    const user = await userService.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    let choiceMsg = `${robot.name} is setup to allow you to also send a(n) ${awardName} point when you send a ${robot.name} point! `;
    choiceMsg += `There are three options how you can setup ${robot.name} to do this:`;
    choiceMsg += `\n• Always send a(n) ${awardName} when you send a ${robot.name} point.\n • Prompt every time to send a ${robot.name} point to include a(n) ${awardName} point.\n • Never include a(n) ${awardName} point with ${robot.name} points.`;
    choiceMsg += `\n\nHow would you like to configure ${robot.name}? (You can always change this later by DMing me \`change my ${awardName} settings\`)\n[ \`Always\` | \`Prompt\` | \`Never\` ]`;
    robot.messageRoom(user.slackId, choiceMsg);
    dialog.addChoice(/always/i, async () => {
      await userService.setAwardCoResponse(user, AwardCoResponse.ALWAYS);
      msg.reply(
        `Thank you! We've updated your ${robot.name}->${awardName} integration settings`,
      );
    });
    dialog.addChoice(/prompt/i, async () => {
      await userService.setAwardCoResponse(user, AwardCoResponse.PROMPT);
      msg.reply(
        `Thank you! We've updated your ${robot.name}->${awardName} integration settings`,
      );
    });
    dialog.addChoice(/never/i, async () => {
      await userService.setAwardCoResponse(user, AwardCoResponse.NEVER);
      msg.reply(
        `Thank you! We've updated your ${robot.name}->${awardName} integration settings`,
      );
    });
  }

  async function changeAwardCoAmount(msg) {
    const switchBoard = new Conversation(robot);
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${robot.name} in DM.`);
      return;
    }

    const user = await userService.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    let choiceMsg = `${robot.name} is setup to allow you to also send ${awardName} point(s) when you send a ${robot.name} point!\n`;
    choiceMsg += `Currently you are set to send *${
      user.awardCoAmount || 1
    }* point(s). Respond with a number to change this amount.`;
    robot.messageRoom(user.slackId, choiceMsg);
    dialog.addChoice(/(?<amount>[0-9]+)/i, async (msg2) => {
      const amount = parseInt(msg2.match.groups.amount || 1, 10);
      await userService.setAwardCoAmount(user, amount);
      msg.reply(
        `Thank you! We've updated your ${robot.name}->${awardName} amount to *${amount}*`,
      );
    });
  }

  async function toggleAwardCoDM(msg) {
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${robot.name} in DM.`);
      return;
    }

    let user = await userService.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    await userService.toggleAwardCoDM(user);
    user = await userService.getUser(msg.message.user.id);
    msg.reply(
      `Thank you! We've updated your ${robot.name}->${awardName} DM config. ${
        user.awardCoDM
          ? `${robot.name} will DM you again.`
          : `${robot.name} won't DM you any more.`
      }`,
    );
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
  async function handlePlusPlus(events) {
    const switchBoard = new Conversation(robot);
    if (events.direction !== '++' && events.direction !== '+') {
      robot.logger.debug(
        `Points were taken away, not given. We won't talk to ${awardName} for this one.\n${JSON.stringify(
          events.direction,
        )}`,
      );
      return;
    }

    if (!events.sender.slackEmail || !events.recipient.slackEmail) {
      const message = `<@${events.sender.slackId}> is trying to send to <@${events.recipient.slackId}> but the one of the emails are missing. Sender: [${events.sender.slackEmail}], Recipient: [${events.recipient.slackEmail}]`;
      robot.logger.error(message);
      robot.emit('plus-plus-failure', {
        notificationMessage: `${message} in <#${events.room}>`,
        room: events.room,
      });
      return;
    }

    const { awardCoAmount = 1 } = await userService.getUser(
      events.sender.slackId,
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
        robot.messageRoom(
          events.sender.slackId,
          "We didn't receive your response in time. Please try again.",
        );
      };
      // check with user how they want to handle hubot points/awardCo awards
      let choiceMsg = `${robot.name} is setup to allow you to also send a(n) ${awardName} point when you send a ${robot.name} point! `;
      choiceMsg += `There are three options how you can setup ${robot.name} to do this:`;
      choiceMsg += `\n• Always send a(n) ${awardName} when you send a ${robot.name} point.\n • Prompt every time to send a ${robot.name} point to include a(n) ${awardName} point.\n • Never include a(n) ${awardName} point with ${robot.name} points.`;
      choiceMsg += `\n\nHow would you like to configure ${robot.name}? (You can always change this later by DMing me \`change my ${awardName} settings\`)\n[ \`Always\` | \`Prompt\` | \`Never\` ]`;
      robot.messageRoom(events.sender.slackId, choiceMsg);
      dialog.addChoice(/always/i, async () => {
        await userService.setAwardCoResponse(
          events.sender,
          AwardCoResponse.ALWAYS,
        );
        const awardResponses = await awardCoService.sendAwards(events);
        robot.emit('plus-plus-awardCo-sent', awardResponses);
      });
      dialog.addChoice(/prompt/i, async () => {
        await userService.setAwardCoResponse(
          events.sender,
          AwardCoResponse.PROMPT,
        );
        robot.messageRoom(
          events.sender.slackId,
          `In that case, do you want to send <@${events
            .map((e) => e.recipient.slackId)
            .join('>, <@')}> a(n) ${awardName} worth ${
            events.amount
          }?\n[ \`Yes\` | \`No\` ]`,
        );
        dialog.addChoice(/yes/i, async () => {
          const awardResponses = await awardCoService.sendAwards(events);
          robot.emit('plus-plus-awardCo-sent', awardResponses);
        });
        dialog.addChoice(/no/i, async () => {
          robot.messageRoom(events.sender.slackId, 'Ah, alright. Next time!');
        });
      });
      dialog.addChoice(/never/i, async () => {
        await userService.setAwardCoResponse(
          events.sender,
          AwardCoResponse.NEVER,
        );
        robot.messageRoom(
          events.sender.slackId,
          'Alright! No worries. If you ever change your mind we can change your mind just let me know (DM me `change my awardCo settings`)!',
        );
      });
      return;
    }

    if (events.sender.awardCoResponse === AwardCoResponse.ALWAYS) {
      const awardResponses = await awardCoService.sendAwards(events);
      robot.emit('plus-plus-awardCo-sent', awardResponses);
    } else if (events.sender.awardCoResponse === AwardCoResponse.PROMPT) {
      const dialog = switchBoard.startDialog(msg);
      dialog.dialogTimeout = () => {
        robot.messageRoom(
          events.sender.slackId,
          "We didn't receive your response in time. Please try again.",
        );
      };
      robot.messageRoom(
        events.sender.slackId,
        `You just gave <@${events.recipient.slackId}> a ${robot.name} point and ${awardName} is enabled, would you like to send them ${events.amount} point(s) on ${awardName} as well?\n[ \`Yes\` | \`No\` ]`,
      );
      dialog.addChoice(/yes/i, async () => {
        const awardResponses = await awardCoService.sendAwards(events);
        robot.emit('plus-plus-awardCo-sent', awardResponses);
      });
      dialog.addChoice(/no/i, () => {
        robot.messageRoom(events.sender.slackId, 'Ah, alright. Next time!');
      });
    }
  }

  async function handleAwardCoSent(awardResponses) {
    const messages = [];
    for (const ar of awardResponses) {
      if (ar.response.success === true) {
        robot.logger.debug('awardCo point was sent and we caught the event.');
        messages.push(
          `We sent a(n) ${awardName} to <@${ar.event.recipient.slackId}>.`,
        );
        const user = await userService.getUser(ar.event.sender.slackId);
        if (user.awardCoDM === true || user.awardCoDM === undefined) {
          let dm = `We sent <@${ar.event.recipient.slackId}> an award via ${awardName}.`;
          /* if ((!user.awardCoAmount || e.event.amount === 1) && Helpers.rngBoolean()) {
          dm += `\n\nDid you know you could change the amount you send per ${robot.name} Point?\n Just DM @${robot.name} \`change my ${awardName} points setting\`,`;
          dm += '\nI will ask you about how many points you\'d like to send per `++` you respond with a number.\n :tada: Bingo Bango Bongo, you\'re all set.';
        } */
          if (user.awardCoDM === undefined && Helpers.rngBoolean()) {
            dm += `\n\nDon't like these DMs about ${awardName}?\nJust DM @${robot.name} \`toggle dm about ${awardName}\` and we will turn off this DM.`;
          }
          robot.messageRoom(ar.event.sender.slackId, dm);
        }
      } else {
        robot.logger.error('there was an issue sending a award', ar.response);
        messages.push(
          `Sorry, there was an issue sending your ${awardName} award: ${ar.response.message}`,
        );
      }
    }
    awardResponses[0].event.msg.send(messages);
  }
};

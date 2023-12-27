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
const PlusPlusMessageHandler = require('./lib/plusPlusHandler');
const AwardCoMessageHandler = require('./lib/awardCoSentHandler');

module.exports = function (robot) {
  const procVars = Helpers.createProcVars(robot.name);
  const userService = new UserService(robot);
  const awardCoMessageHandler = new AwardCoMessageHandler(robot);
  const plusPlusMessageHandler = new PlusPlusMessageHandler(robot);

  const awardName = procVars.awardCoName;
  if (!procVars.awardCoApiKey) {
    robot.logger.error(
      'hubot-plusplus-expanded-awardCo is installed but the awardCo api key is not configured'
    );
    return;
  }

  robot.on('plus-plus', plusPlusMessageHandler.handlePlusPlus);
  robot.on('plus-plus-awardCo-sent', awardCoMessageHandler.handleAwardCoSent);
  const changeSettingsRegExp = new RegExp(
    `.*change.*${awardName}\\s?(?:integration)?\\s?(?:configuration|config|response|setting|settings).*`,
    'ig'
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
        "I'm sorry we could not find your user account. Please contact an admin"
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
        `Thank you! We've updated your ${robot.name}->${awardName} integration settings`
      );
    });
    dialog.addChoice(/prompt/i, async () => {
      await userService.setAwardCoResponse(user, AwardCoResponse.PROMPT);
      msg.reply(
        `Thank you! We've updated your ${robot.name}->${awardName} integration settings`
      );
    });
    dialog.addChoice(/never/i, async () => {
      await userService.setAwardCoResponse(user, AwardCoResponse.NEVER);
      msg.reply(
        `Thank you! We've updated your ${robot.name}->${awardName} integration settings`
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
        "I'm sorry we could not find your user account. Please contact an admin"
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
        `Thank you! We've updated your ${robot.name}->${awardName} amount to *${amount}*`
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
        "I'm sorry we could not find your user account. Please contact an admin"
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
      }`
    );
  }
};

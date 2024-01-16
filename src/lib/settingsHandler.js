const Conversation = require('hubot-conversation');
const H = require('./helpers');
const { us } = require('./service/UserService');
const { AwardCoResponse } = require('./service/AwardCoResponseEnum');

class SettingsHandler {
  static async changeAwardCoConfig(msg) {
    const { awardCoName } = H.createProcVars(msg.robot.name);
    const switchBoard = new Conversation(msg.robot);
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${msg.robot.name} in DM.`);
      return;
    }

    const user = await us.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    const choiceMsg = `${msg.robot.name} is setup to allow you to also send a(n) ${awardCoName} point when you send a ${msg.robot.name} point!
There are three options how you can setup ${msg.robot.name} to do this:

• Always send a(n) ${awardCoName} when you send a ${msg.robot.name} point.
• Prompt every time to send a ${msg.robot.name} point to include a(n) ${awardCoName} point.
• Never include a(n) ${awardCoName} point with ${msg.robot.name} points.

How would you like to configure ${msg.robot.name}? (You can always change this later by DMing me \`change my ${awardCoName} settings\`)

[ \`Always\` | \`Prompt\` | \`Never\` ]`;

    msg.robot.messageRoom(user.slackId, choiceMsg);
    dialog.addChoice(/always/i, async () => {
      await us.setAwardCoResponse(user, AwardCoResponse.ALWAYS);
      msg.reply(
        `Thank you! We've updated your ${msg.robot.name}->${awardCoName} integration settings`,
      );
    });
    dialog.addChoice(/prompt/i, async () => {
      await us.setAwardCoResponse(user, AwardCoResponse.PROMPT);
      msg.reply(
        `Thank you! We've updated your ${msg.robot.name}->${awardCoName} integration settings`,
      );
    });
    dialog.addChoice(/never/i, async () => {
      await us.setAwardCoResponse(user, AwardCoResponse.NEVER);
      msg.reply(
        `Thank you! We've updated your ${msg.robot.name}->${awardCoName} integration settings`,
      );
    });
  }

  static async changeAwardCoAmount(msg) {
    const { awardCoName } = H.createProcVars(msg.robot.name);

    const switchBoard = new Conversation(msg.robot);
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${msg.robot.name} in DM.`);
      return;
    }

    const user = await us.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    let choiceMsg = `${msg.robot.name} is setup to allow you to also send ${awardCoName} point(s) when you send a ${msg.robot.name} point!\n`;
    choiceMsg += `Currently you are set to send *${
      user.awardCoAmount || 1
    }* point(s). Respond with a number to change this amount.`;
    msg.robot.messageRoom(user.slackId, choiceMsg);
    dialog.addChoice(/(?<amount>[0-9]+)/i, async (msg2) => {
      const amount = parseInt(msg2.match.groups.amount || 1, 10);
      await us.setAwardCoAmount(user, amount);
      msg.reply(
        `Thank you! We've updated your ${msg.robot.name}->${awardCoName} amount to *${amount}*`,
      );
    });
  }

  static async toggleAwardCoDM(msg) {
    const { awardCoName } = H.createProcVars(msg.robot.name);

    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${msg.robot.name} in DM.`);
      return;
    }

    let user = await us.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    await us.toggleAwardCoDM(user);
    user = await us.getUser(msg.message.user.id);
    const willOrWont = user.awardCoDM
      ? `${msg.robot.name} will DM you again.`
      : `${msg.robot.name} won't DM you any more.`;
    msg.reply(
      `Thank you! We've updated your ${msg.robot.name}->${awardCoName} DM config. ${willOrWont}`,
    );
  }
}

module.exports = SettingsHandler;
module.exports.sh = SettingsHandler;

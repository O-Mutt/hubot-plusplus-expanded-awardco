const Conversation = require('hubot-conversation');
const Helpers = require('./helpers');
const UserService = require('./service/UserService');
const { AwardCoResponse } = require('./service/AwardCoResponseEnum');

class SettingsHandler {
  constructor(robot) {
    const procVars = Helpers.createProcVars(robot.name);

    this.robot = robot;
    this.awardName = procVars.awardCoName;
    this.userService = new UserService(robot);
  }

  async changeAwardCoConfig(msg) {
    const switchBoard = new Conversation(this.robot);
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${this.robot.name} in DM.`);
      return;
    }

    const user = await this.userService.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    let choiceMsg = `${this.robot.name} is setup to allow you to also send a(n) ${this.awardName} point when you send a ${this.robot.name} point! `;
    choiceMsg += `There are three options how you can setup ${this.robot.name} to do this:`;
    choiceMsg += `\n• Always send a(n) ${this.awardName} when you send a ${this.robot.name} point.\n • Prompt every time to send a ${this.robot.name} point to include a(n) ${this.awardName} point.\n • Never include a(n) ${this.awardName} point with ${this.robot.name} points.`;
    choiceMsg += `\n\nHow would you like to configure ${this.robot.name}? (You can always change this later by DMing me \`change my ${this.awardName} settings\`)\n[ \`Always\` | \`Prompt\` | \`Never\` ]`;
    this.robot.messageRoom(user.slackId, choiceMsg);
    dialog.addChoice(/always/i, async () => {
      await this.userService.setAwardCoResponse(user, AwardCoResponse.ALWAYS);
      msg.reply(
        `Thank you! We've updated your ${this.robot.name}->${this.awardName} integration settings`,
      );
    });
    dialog.addChoice(/prompt/i, async () => {
      await this.userService.setAwardCoResponse(user, AwardCoResponse.PROMPT);
      msg.reply(
        `Thank you! We've updated your ${this.robot.name}->${this.awardName} integration settings`,
      );
    });
    dialog.addChoice(/never/i, async () => {
      await this.userService.setAwardCoResponse(user, AwardCoResponse.NEVER);
      msg.reply(
        `Thank you! We've updated your ${this.robot.name}->${this.awardName} integration settings`,
      );
    });
  }

  async changeAwardCoAmount(msg) {
    const switchBoard = new Conversation(this.robot);
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${this.robot.name} in DM.`);
      return;
    }

    const user = await this.userService.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    let choiceMsg = `${this.robot.name} is setup to allow you to also send ${this.awardName} point(s) when you send a ${this.robot.name} point!\n`;
    choiceMsg += `Currently you are set to send *${
      user.awardCoAmount || 1
    }* point(s). Respond with a number to change this amount.`;
    this.robot.messageRoom(user.slackId, choiceMsg);
    dialog.addChoice(/(?<amount>[0-9]+)/i, async (msg2) => {
      const amount = parseInt(msg2.match.groups.amount || 1, 10);
      await this.userService.setAwardCoAmount(user, amount);
      msg.reply(
        `Thank you! We've updated your ${this.robot.name}->${this.awardName} amount to *${amount}*`,
      );
    });
  }

  async toggleAwardCoDM(msg) {
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${this.robot.name} in DM.`);
      return;
    }

    let user = await this.userService.getUser(msg.message.user.id);
    if (!user) {
      msg.reply(
        "I'm sorry we could not find your user account. Please contact an admin",
      );
      return;
    }

    await this.userService.toggleAwardCoDM(user);
    user = await this.userService.getUser(msg.message.user.id);
    msg.reply(
      `Thank you! We've updated your ${this.robot.name}->${
        this.awardName
      } DM config. ${
        user.awardCoDM
          ? `${this.robot.name} will DM you again.`
          : `${this.robot.name} won't DM you any more.`
      }`,
    );
  }
}

module.exports = SettingsHandler;

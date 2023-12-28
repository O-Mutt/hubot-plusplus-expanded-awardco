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

const Helpers = require('./lib/helpers');
const PlusPlusMessageHandler = require('./lib/plusPlusHandler');
const AwardCoMessageHandler = require('./lib/awardCoSentHandler');
const SettingsHandler = require('./lib/settingsHandler');

module.exports = (robot) => {
  const procVars = Helpers.createProcVars(robot.name);
  const awardCoMessageHandler = new AwardCoMessageHandler(robot);
  const plusPlusMessageHandler = new PlusPlusMessageHandler(robot);
  const settingsHandler = new SettingsHandler(robot);

  const awardName = procVars.awardCoName;
  if (!procVars.awardCoApiKey) {
    robot.logger.error(
      'hubot-plusplus-expanded-awardCo is installed but the awardCo api key is not configured',
    );
    return;
  }

  robot.on('plus-plus', plusPlusMessageHandler.handlePlusPlus);
  robot.on('plus-plus-awardCo-sent', awardCoMessageHandler.handleAwardCoSent);
  const changeSettingsRegExp = new RegExp(
    `.*change.*${awardName}\\s?(?:integration)?\\s?(?:configuration|config|response|setting|settings).*`,
    'ig',
  );
  const dmSettingRegExp = new RegExp(`.*toggle dm about ${awardName}.*`, 'ig');
  robot.respond(changeSettingsRegExp, settingsHandler.changeAwardCoConfig);
  // robot.respond(/.*change.*awardCo.*(points|amount).*/ig, changeAwardCoAmount);
  robot.respond(dmSettingRegExp, settingsHandler.toggleAwardCoDM);
};

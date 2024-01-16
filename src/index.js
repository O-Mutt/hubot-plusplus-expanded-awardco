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

const H = require('./lib/helpers');
const { ppmh } = require('./lib/plusPlusHandler');
const { acmh } = require('./lib/awardCoSentHandler');
const { sh } = require('./lib/settingsHandler');

module.exports = (robot) => {
  const { awardCoName, awardCoApiKey } = H.createProcVars(robot.name);

  if (!awardCoApiKey) {
    robot.logger.error(
      'hubot-plusplus-expanded-awardCo is installed but the awardCo api key is not configured',
    );
    return;
  }

  robot.on('plus-plus', (...args) => ppmh.handlePlusPlus(robot, args));
  robot.on('plus-plus-awardCo-sent', (...args) =>
    acmh.handleAwardCoSent(robot, args),
  );

  const changeSettingsRegExp = new RegExp(
    `.*change.*${awardCoName}\\s?(?:integration)?\\s?(?:configuration|config|response|setting|settings).*`,
    'ig',
  );
  robot.respond(changeSettingsRegExp, sh.changeAwardCoConfig);
  // robot.respond(/.*change.*awardCo.*(points|amount).*/ig, changeAwardCoAmount);
  const dmSettingRegExp = new RegExp(
    `.*toggle dm about ${awardCoName}.*`,
    'ig',
  );
  robot.respond(dmSettingRegExp, sh.toggleAwardCoDM);
};

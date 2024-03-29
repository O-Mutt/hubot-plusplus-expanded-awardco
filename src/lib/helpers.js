function createProcVars(robotName) {
  const { env } = process;
  const procVars = {};
  procVars.robotName = robotName ?? 'hubot';
  procVars.mongoUri = env.MONGO_URI ?? 'mongodb://localhost/plusPlus';
  procVars.awardCoApiKey = env.AWARDCO_API_KEY;
  procVars.awardCoUri = env.AWARDCO_URI ?? 'https://api.awardco.com/api';
  procVars.awardCoName = env.AWARDCO_WHITELABEL_NAME ?? 'Award';
  procVars.awardCoDefaultNote =
    env.AWARDCO_DEFAULT_NOTE ??
    `${procVars.awardCoName} given through ${robotName}`;
  return procVars;
}

function rngBoolean() {
  // 35% chance to be true
  return Math.random() < 0.35;
}

module.exports = {
  createProcVars,
  rngBoolean,
};

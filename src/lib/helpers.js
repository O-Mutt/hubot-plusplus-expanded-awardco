function createProcVars(env) {
  const procVars = {};
  procVars.mongoUri = env.MONGO_URI || 'mongodb://localhost/plusPlus';
  procVars.awardCoApiKey = env.AWARDCO_API_KEY;
  procVars.awardCoUri = env.AWARDCO_URI || 'https://api.awardco.com/api';
  procVars.awardCoDefaultNote = env.AWARDCO_DEFAULT_NOTE;
  procVars.awardCoName = env.AWARDCO_WHITELABEL_NAME || 'Award Co';
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

/* eslint-disable no-console */
/* eslint-disable no-continue */
const fs = require('fs');
const path = require('path');

function loadScripts(robot, directory) {
  const results = [];

  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recurse into subdirectory
      results.push(...loadScripts(robot, filePath));
    } else if (!file.endsWith('.test.js') && path.extname(file) === '.js') {
      // Load .js files that don't export a class
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const exported = require(filePath);
      if (
        exported instanceof Function &&
        !exported.toString().startsWith('class')
      ) {
        results.push(robot.loadFile(directory, file));
      }
    }
  });

  return results;
}

module.exports = (robot, scripts) => {
  const scriptsPath = path.resolve(__dirname, 'src');
  return fs.exists(scriptsPath, (exists) => {
    if (exists) {
      const scriptsToLoad =
        scripts && scripts.indexOf('*') < 0 ? scripts : null;
      const loadedScripts = loadScripts(robot, scriptsPath);

      // Filter out scripts that weren't loaded
      if (scriptsToLoad) {
        const missingScripts = scriptsToLoad.filter(
          (script) => !loadedScripts.includes(script),
        );
        if (missingScripts.length > 0) {
          console.error(
            `Hubot couldn't find the following scripts: ${missingScripts.join(
              ', ',
            )}`,
          );
        }
      }
    }
  });
};

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
/* eslint-disable no-continue */

const fs = require('fs');
const path = require('path');

function isIgnored(file, filePath) {
  if (file === '__tests__' || file === '__mocks__') {
    return true;
  }

  if (filePath) {
    if (
      file.endsWith('.test.js') ||
      file.endsWith('.test.coffee') ||
      file.endsWith('.test.ts')
    ) {
      return true;
    }
    if (path.extname(file) === '.js') {
      const maybeExported = require(filePath);
      if (
        !(maybeExported instanceof Function) ||
        maybeExported.toString().startsWith('class')
      ) {
        return true;
      }
    }
  }
  return false;
}

function loadScripts(robot, directory) {
  const results = [];

  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory() && !isIgnored(file)) {
      // Recurse into subdirectory
      results.push(...loadScripts(robot, filePath));
    } else if (!isIgnored(file, path, filePath)) {
      results.push(robot.loadFile(directory, file));
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

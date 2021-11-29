var path = require('path')
var rootDir = path.join(__dirname, '..')

function exec (command, cwd) {
  // pass the parent´s stdio to the child process
  // http://stackoverflow.com/a/31104898
  require('child_process').execSync(command, { cwd: cwd, stdio: [0, 1, 2] })
}

exec('yarn lint', rootDir)
exec('yarn test:browser', rootDir)
exec('yarn test:node', rootDir)
exec('yarn test:types', rootDir)
exec('cross-env SINGLE_RUN=true yarn test:browser:integration', rootDir)
exec('cross-env SINGLE_RUN=true yarn test:node:integration', rootDir)

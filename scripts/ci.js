const path = require('path')
const rootDir = path.join(__dirname, '..')
const child_process = require('child_process')

function exec(command, cwd) {
  // pass the parent´s stdio to the child process
  // http://stackoverflow.com/a/31104898
  child_process.execSync(command, { cwd: cwd, stdio: [0, 1, 2] })
}

exec(
  'concurrently -c "auto" --names "browser:unit,node:unit,service-worker:unit,browser:integration,node:integration" \
    "yarn test:browser" \
    "yarn test:node" \
    "yarn test:service-worker" \
    "cross-env SINGLE_RUN=true yarn test:browser:integration" \
    "cross-env SINGLE_RUN=true yarn test:node:integration" \
  ',
  rootDir
)

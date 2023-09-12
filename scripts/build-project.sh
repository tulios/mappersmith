#!/bin/bash
set -euv

sh -c "NODE_ENV=production yarn build:clean"
# cp -r LICENSE README.md package.json src/version.json lib/
# cp examples/basic.js lib/example.js

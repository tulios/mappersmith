#!/bin/bash
set -euv

sh -c "NODE_ENV=production npm run build"
cp -r LICENSE README.md package.json typings lib/
cp examples/basic.js lib/example.js
sh -c "cd lib; npm publish"

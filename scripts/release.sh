#!/bin/bash
set -euv

sh -c "NODE_ENV=production npm run build"
cp -r example.js LICENSE README.md package.json typings lib/
sh -c "cd lib; npm publish"

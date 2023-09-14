#!/bin/bash
set -euv

sh -c "NODE_ENV=production yarn build:clean"
cp LICENSE README.md CHANGELOG.md dist/
cp -r src/ dist/src/
cp -r examples/ dist/examples/

# Touch yarn.lock to make it possible to link to dist/ folder. It wont be published.
touch dist/yarn.lock

# Prepare package.json for publishing
#  1. Remove /dist/
#  2. Remove private: true
cp package.json dist/
sed 's/\/dist\//\//g' dist/package.json > dist/package-temp.json && mv dist/package-temp.json dist/package.json
sed '/"private": true/d' dist/package.json > dist/package-temp.json && mv dist/package-temp.json dist/package.json

cd dist
npm publish --dry-run
echo "Done!"
cd ..

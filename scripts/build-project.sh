#!/bin/bash
set -euv

sh -c "pnpm run build:clean"
echo "Copying other files..."
cp -r LICENSE README.md packages/core/package.json dist/core
cp -r packages/core/src/version.json dist/core/src
cp -r LICENSE README.md packages/test/package.json dist/test

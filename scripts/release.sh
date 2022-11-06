#!/bin/bash
set -euv

sh -c ./scripts/build-project.sh
sh -c "cd dist/core; npm publish"

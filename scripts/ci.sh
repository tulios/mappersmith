#!/bin/bash
set -euv

env
yarn test-browser
yarn test-node
yarn test-browser-integration
yarn test-node-integration

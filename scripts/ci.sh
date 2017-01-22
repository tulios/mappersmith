#!/bin/bash
set -euv

env
npm run test-browser
npm run test-node
npm run test-browser-integration
npm run test-node-integration

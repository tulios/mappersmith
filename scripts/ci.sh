#!/bin/bash
set -euv

sh -c "npm run test-browser"
sh -c "npm run test-node"
sh -c "npm run test-browser-integration"
sh -c "npm run test-node-integration"

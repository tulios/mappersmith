#!/bin/bash
set -euv

SINGLE_RUN=true yarn test-browser
SINGLE_RUN=true yarn test-node
SINGLE_RUN=true yarn test-browser-integration
SINGLE_RUN=true yarn test-node-integration

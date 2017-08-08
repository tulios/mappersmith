#!/bin/bash
set -euv

yarn test:browser -s \
  && yarn test:node -s \
  && SINGLE_RUN=true yarn test:browser:integration -s \
  && SINGLE_RUN=true yarn test:node:integration -s

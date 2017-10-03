#!/bin/bash
set -euvx

yarn lint \
  && yarn test:browser \
  && yarn test:node \
  && SINGLE_RUN=true yarn test:browser:integration \
  && SINGLE_RUN=true yarn test:node:integration

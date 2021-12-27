#!/usr/bin/env bash

set -e
source .ci/config.sh

docker build \
  --file .ci/Dockerfile \
  --build-arg GOOGLE_OAUTH_CLIENT_ID=${GOOGLE_OAUTH_CLIENT_ID} \
  --tag "${TARGET_IMAGE}:${VERSION}" \
  --tag "${TARGET_IMAGE}:latest" \
  .

#!/usr/bin/env bash

set -e
source .ci/config.sh

CURRENT_TIMESTAMP=$(date -u "+%Y-%m-%dT%H:%M:%SZ")

docker build \
  --file .ci/Dockerfile \
  --label "app.build-info.service-name=${APP_NAME}" \
  --label "app.build-info.build-time=${CURRENT_TIMESTAMP}" \
  --label "app.build-info.git-branch=${GIT_BRANCH_NAME}" \
  --label "app.build-info.git-commit=${GIT_COMMIT}" \
  --label "app.build-info.git-repo=${GIT_REPO_URL}" \
  --label "app.build-info.git-user-email=${GIT_AUTHOR_EMAIL}" \
  --build-arg REACT_APP_GOOGLE_OAUTH_CLIENT_ID=${REACT_APP_GOOGLE_OAUTH_CLIENT_ID} \
  --tag "${TARGET_IMAGE}:${VERSION}" \
  --tag "${TARGET_IMAGE}:latest" \
  .

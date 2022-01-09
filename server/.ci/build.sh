#!/usr/bin/env bash

set -e
source .ci/config.sh

CURRENT_TIMESTAMP=$(date -u "+%Y-%m-%dT%H:%M:%SZ")

INJECT_PACKAGE=${GO_ROOT_IMPORT_PATH}/internal/lib/app
INJECT_FLAGS=""
INJECT_FLAGS=" ${INJECT_FLAGS} -X ${INJECT_PACKAGE}.ServiceName=${APP_NAME}"
INJECT_FLAGS=" ${INJECT_FLAGS} -X ${INJECT_PACKAGE}.BuildBranch=${GIT_BRANCH_NAME}"
INJECT_FLAGS=" ${INJECT_FLAGS} -X ${INJECT_PACKAGE}.BuildVersion=${GIT_COMMIT}"
INJECT_FLAGS=" ${INJECT_FLAGS} -X ${INJECT_PACKAGE}.BuildDate=${CURRENT_TIMESTAMP}"

docker build \
	--file .ci/Dockerfile \
  --label "app.build-info.service-name=${APP_NAME}" \
  --label "app.build-info.build-time=${CURRENT_TIMESTAMP}" \
  --label "app.build-info.git-branch=${GIT_BRANCH_NAME}" \
  --label "app.build-info.git-commit=${GIT_COMMIT}" \
  --label "app.build-info.git-repo=${GIT_REPO_URL}" \
  --label "app.build-info.git-user-email=${GIT_AUTHOR_EMAIL}" \
  --build-arg INJECT_FLAGS="${INJECT_FLAGS}" \
	--tag "${TARGET_IMAGE}:${VERSION}" \
	--tag "${TARGET_IMAGE}:latest" \
	.

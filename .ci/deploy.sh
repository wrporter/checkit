#!/usr/bin/env bash

set -ex

APP_NAME="checkit"

BASE_DIRECTORY="/volume1/docker/"
SSH_USER="wesp"
SSH_HOST="roshar"
DOCKER_REGISTRY="192.168.1.222:5555"

scp $(pwd)/.ci/docker-compose.yml ${SSH_USER}@${SSH_HOST}:${BASE_DIRECTORY}${APP_NAME}/docker-compose.yml
(cd server && .ci/build.sh && .ci/deploy.sh)
(cd ui && .ci/build.sh && .ci/deploy.sh)

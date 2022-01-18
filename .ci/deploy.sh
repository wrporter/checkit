#!/usr/bin/env bash

set -ex

APP_NAME="checkit"

BASE_DIRECTORY="/volume1/docker/"
DOCKER_REGISTRY="192.168.1.222:5555"
SCP_PORT="-P ${SSH_PORT}"

sed "s/\${GOOGLE_OAUTH_CLIENT_ID}/${GOOGLE_OAUTH_CLIENT_ID}/g" .ci/docker-compose.yml | \
    sed "s/\${GOOGLE_OAUTH_CLIENT_SECRET}/${GOOGLE_OAUTH_CLIENT_SECRET}/g" \
    > .ci/docker-compose.tmp.yml

echo "sunbeam.cf"
scp -P 2614 $(pwd)/.ci/docker-compose.tmp.yml wesp@sunbeam.cf:${BASE_DIRECTORY}${APP_NAME}/docker-compose.yml

rm .ci/docker-compose.tmp.yml

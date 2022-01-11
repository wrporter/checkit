#!/usr/bin/env bash

set -ex

APP_NAME="checkit"

BASE_DIRECTORY="/volume1/docker/"
DOCKER_REGISTRY="192.168.1.222:5555"

sed "s/\${GOOGLE_OAUTH_CLIENT_ID}/${GOOGLE_OAUTH_CLIENT_ID}/g" .ci/docker-compose.yml | \
    sed "s/\${GOOGLE_OAUTH_CLIENT_SECRET}/${GOOGLE_OAUTH_CLIENT_SECRET}/g" \
    > .ci/docker-compose.tmp.yml

scp ${SSH_PORT} $(pwd)/.ci/docker-compose.tmp.yml ${SSH_USER}@${SSH_HOST}:${BASE_DIRECTORY}${APP_NAME}/docker-compose.yml

rm .ci/docker-compose.tmp.yml

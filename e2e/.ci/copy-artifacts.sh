#!/usr/bin/env bash

#set -e
source .ci/config.sh

#container_id=$(docker create ${TARGET_IMAGE}:${VERSION})
docker cp ${APP_NAME}:/src/cypress/results/. $(pwd)/cypress/results
docker cp ${APP_NAME}:/src/cypress/screenshots/. $(pwd)/cypress/screenshots
docker cp ${APP_NAME}:/src/cypress/videos/. $(pwd)/cypress/videos
#docker rm -v ${APP_NAME}

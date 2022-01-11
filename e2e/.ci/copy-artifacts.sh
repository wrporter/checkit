#!/usr/bin/env bash

#set -e
source .ci/config.sh

#container_id=$(docker create ${TARGET_IMAGE}:${VERSION})
docker cp ${APP_NAME}:/src/cypress/results/. $(pwd)/results/report
docker cp ${APP_NAME}:/src/cypress/screenshots/. $(pwd)/results/screenshots
docker cp ${APP_NAME}:/src/cypress/videos/. $(pwd)/results/videos
#docker rm -v ${APP_NAME}

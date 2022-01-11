#!/usr/bin/env bash

#set -e

source .ci/config.sh

mkdir -p $(pwd)/results

# Use if docker build produces the results
#container_id=$(docker create ${TARGET_IMAGE}:${VERSION})

docker cp ${APP_NAME}:/src/cypress/results/. $(pwd)/results/report || true
docker cp ${APP_NAME}:/src/cypress/screenshots/. $(pwd)/results/screenshots || true
docker cp ${APP_NAME}:/src/cypress/videos/. $(pwd)/results/videos || true

docker rm -v ${APP_NAME}

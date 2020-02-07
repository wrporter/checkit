#!/usr/bin/env bash

APP_NAME="checkit"

scp $(pwd)/.ci/docker-compose.yml x-wing@x-wing:/home/x-wing/www/${APP_NAME}/docker-compose.yml
(cd server && .ci/build.sh && .ci/deploy.sh)
(cd ui && .ci/build.sh && .ci/deploy.sh)

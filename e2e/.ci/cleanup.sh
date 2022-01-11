#!/usr/bin/env bash

set -e
source .ci/config.sh

docker rm ${APP_NAME} >/dev/null 2>&1 || true

#!/usr/bin/env bash

source .ci/config.sh

docker run \
	--name=${APP_NAME} \
	${TARGET_IMAGE}:${VERSION}

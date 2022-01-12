#!/usr/bin/env bash

source .ci/config.sh

docker run -t \
	--name=${APP_NAME} \
	${TARGET_IMAGE}:${VERSION}

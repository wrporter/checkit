#!/usr/bin/env bash

source .ci/config.sh

docker run \
	--rm \
	--name=${APP_NAME} \
	-e API_HOST="host.docker.internal" \
	-p 9010:80 \
	${TARGET_IMAGE}:${VERSION}

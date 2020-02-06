#!/usr/bin/env bash

source .ci/config.sh

docker run \
	--rm \
	--name=${APP_NAME} \
	-e GOOGLE_OAUTH_CLIENT_ID="TODO" \
	-e GOOGLE_OAUTH_CLIENT_SECRET="TODO" \
	-e APP_HOST= \
	-p ${PORT}:${PORT} \
	${TARGET_IMAGE}:${VERSION}

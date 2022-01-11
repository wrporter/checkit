#!/usr/bin/env bash

set -e

.ci/deploy.sh
(cd server && .ci/build.sh && .ci/deploy.sh)
(cd ui && .ci/build.sh && .ci/deploy.sh)

#!/usr/bin/env bash

docker run \
  --rm \
  --name mongo \
  -v $(pwd)/db:/data/db \
  -p 27017:27017 \
  mongo

#!/usr/bin/env bash

docker run \
  --rm \
  --name mongo \
  -p 27017:27017 \
  mongo

#!/usr/bin/env bash

docker run \
  --name mongo \
  -p 27017:27017 \
  mongo

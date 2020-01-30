#!/usr/bin/env bash

docker run --name=games-app-site --rm \
    -v $(pwd)/ui/dist:/srv \
    -v $(pwd)/site/Caddyfile:/etc/Caddyfile \
    -p 2015:2015 \
    abiosoft/caddy

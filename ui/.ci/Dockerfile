###############################################################################
# Build Static Assets
###############################################################################
FROM alpine:3.15 AS static
LABEL maintainer="wesleyrporter@gmail.com"

RUN apk add --no-cache nodejs npm

WORKDIR /src

COPY package*.json ./
RUN npm ci --loglevel=warn

COPY .eslintrc.yml ./
COPY tsconfig.json ./
COPY src src
COPY public public
RUN npm run ci

###############################################################################
# Build Static Server
###############################################################################
FROM caddy:2-alpine AS server
LABEL maintainer="wesleyrporter@gmail.com"

COPY .ci/Caddyfile /etc/caddy/Caddyfile
COPY --from=static /src/build /srv

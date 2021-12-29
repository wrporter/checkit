###############################################################################
# Build Static Assets
###############################################################################
FROM alpine:3.12 AS static
LABEL maintainer="wesleyrporter@gmail.com"

RUN apk add --no-cache nodejs nodejs-npm

WORKDIR /src

ARG REACT_APP_GOOGLE_OAUTH_CLIENT_ID

COPY package*.json ./
RUN npm ci --loglevel=warn

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

###############################################################################
# Build Static Assets
###############################################################################
FROM alpine:3.11 AS static
LABEL maintainer="wesleyrporter@gmail.com"

RUN apk add --no-cache nodejs nodejs-npm

WORKDIR /src

ARG GOOGLE_OAUTH_CLIENT_ID

COPY package*.json ./
RUN npm ci --loglevel=warn

COPY webpack.config.js .eslintrc.yml .babelrc ./
COPY public /src/public/
COPY src /src/src/
RUN npm run ci

###############################################################################
# Build Static Server
###############################################################################
FROM abiosoft/caddy AS server
LABEL maintainer="wesleyrporter@gmail.com"

COPY .ci/Caddyfile /etc/Caddyfile
COPY --from=static /src/dist /srv

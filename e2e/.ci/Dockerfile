FROM cypress/base:10
LABEL maintainer="wesleyrporter@gmail.com"

WORKDIR /src

COPY package*.json ./
RUN npm ci --loglevel=warn

COPY cypress cypress
COPY cypress.json ./
COPY cypress.env.json ./
COPY tsconfig.json ./

CMD ["npm", "run", "ci"]

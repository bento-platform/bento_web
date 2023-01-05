FROM --platform=$BUILDPLATFORM node:18-bullseye-slim AS install

WORKDIR /web

COPY package.json .
COPY package-lock.json .

RUN npm ci

FROM node:18-bullseye-slim

WORKDIR /web

COPY package.json .
COPY package-lock.json .

COPY --from=install /web/node_modules ./node_modules

ENTRYPOINT [ "sh", "./entrypoint.dev.sh" ]

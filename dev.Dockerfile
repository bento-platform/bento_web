FROM node:18-bullseye-slim

WORKDIR /web

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

ENTRYPOINT [ "sh", "./entrypoint.dev.sh" ]

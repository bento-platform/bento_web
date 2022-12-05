FROM node:18-bullseye-slim AS build
# Build bento_web with NodeJS + Webpack

WORKDIR /web

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.23
# Serve bento_web with NGINX

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /web
COPY --from=build /web/dist ./dist

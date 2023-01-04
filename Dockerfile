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
# Copy webpack-built source code from the build stage to the final image
COPY --from=build /web/dist ./dist
# Copy in default static files
COPY static static
# Copy in the entrypoint, which writes the config file and
COPY entrypoint.bash entrypoint.bash

ENTRYPOINT ["bash", "./entrypoint.bash"]

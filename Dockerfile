FROM --platform=$BUILDPLATFORM node:18-bullseye-slim AS build

# Build bento_web with NodeJS + Webpack
#  - Use BUILDPLATFORM for running webpack, since it should perform a lot better.
#  - Then, the resulting built files will be copied to a TARGETPLATFORM-based final image.

WORKDIR /web

COPY package.json .
COPY package-lock.json .

RUN npm ci

# Explicitly choose what to copy to speed up builds
#  - Copy in build requirements
COPY .babelrc .
COPY create_service_info.js .
COPY webpack.config.js .
#  - Copy in source code
COPY src src
#  - Copy in default static files (which can be overwritten later via volume mount)
COPY static static

RUN npm run build

FROM nginx:1.23

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update -y && \
    apt-get install nodejs

# Serve bento_web with NGINX; copy in configuration
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /web
# Copy webpack-built source code from the build stage to the final image
COPY --from=build /web/dist ./dist
# Copy in package.json to provide version
COPY package.json .
# Copy in the service info generator
COPY create_service_info.js .
# Copy in the entrypoint, which writes the config file and starts NGINX
COPY run.bash .
# Copy in LICENSE so that people can see it if they explore the image contents
COPY LICENSE .

CMD ["bash", "./run.bash"]

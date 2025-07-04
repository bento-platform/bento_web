FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS build

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
COPY tsconfig.json .
#  - Copy in source code
COPY src src
#  - Copy in default static files (which can be overwritten later via volume mount)
COPY static static

RUN npm run build

FROM nginx:1.28

# Install node so that we can run the create_config_prod.js & create_service_info.js scripts
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update -y && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | \
      gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | \
      tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Serve bento_web with NGINX; copy in configuration
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /web

# In general, we want to copy files in order of least -> most changed for layer caching reasons.

# - Copy in LICENSE so that people can see it if they explore the image contents
COPY LICENSE .
# - Copy in the production config generation script
COPY create_config_prod.js .
# - Copy in the service info generator
COPY create_service_info.js .
# - Copy in the entrypoint, which writes the config file and starts NGINX
COPY run.bash .
# - Copy in package.json to provide version to scripts
COPY package.json .
# - Copy webpack-built source code from the build stage to the final image
#    - copy this last, since it changes more often than everything above it
#    - this way we can cache layers
COPY --from=build /web/dist ./dist

CMD ["bash", "./run.bash"]

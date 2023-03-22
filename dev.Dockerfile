FROM --platform=$BUILDPLATFORM node:18-bullseye-slim AS install

WORKDIR /web

COPY package.json .
COPY package-lock.json .

RUN npm ci

FROM ghcr.io/bento-platform/bento_base_image:node-debian-2023.03.22

LABEL org.opencontainers.image.description="Local development image for Bento Web."

WORKDIR /web

COPY package.json .
COPY package-lock.json .
COPY run.dev.bash .

COPY --from=install /web/node_modules ./node_modules

CMD [ "bash", "./run.dev.bash" ]

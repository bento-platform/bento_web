FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS install

WORKDIR /web

COPY package.json .
COPY package-lock.json .

RUN npm ci

FROM ghcr.io/bento-platform/bento_base_image:node-debian-2024.11.01

LABEL org.opencontainers.image.description="Local development image for Bento Web."

WORKDIR /web

COPY run.dev.bash .
COPY package.json .
COPY package-lock.json .

COPY --from=install /web/node_modules ./node_modules

CMD [ "bash", "./run.dev.bash" ]

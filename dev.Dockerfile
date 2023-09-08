FROM --platform=$BUILDPLATFORM node:20-bookworm-slim AS install

WORKDIR /web

COPY package.json .
COPY package-lock.json .

RUN npm ci

FROM ghcr.io/bento-platform/bento_base_image:node-debian-2023.09.08

LABEL org.opencontainers.image.description="Local development image for Bento Web."

WORKDIR /web

COPY package.json .
COPY package-lock.json .
COPY run.dev.bash .

COPY --from=install /web/node_modules ./node_modules

CMD [ "bash", "./run.dev.bash" ]

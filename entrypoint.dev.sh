#!/bin/sh

if [ -z "${BENTO_WEB_PORT}" ]; then
  # Set default internal port to 80
  export BENTO_WEB_PORT=80
fi

npm install
npm run start

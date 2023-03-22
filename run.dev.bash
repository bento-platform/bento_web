#!/bin/bash

# Base image handles making bento_user and setting its .gitconfig

# Set default internal port to 80
: "${BENTO_WEB_PORT:=80}"
export BENTO_WEB_PORT

# ----- Begin /service-info creation ----------------------------------
echo "[bento_web] [entrypoint] creating service-info file"
node ./create_service_info.js > dist/static/service-info.json
# ----- End -----------------------------------------------------------

echo "[bento_web] [entrypoint] running npm install"
npm install

echo "[bento_web] [entrypoint] starting"
npm run start

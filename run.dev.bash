#!/bin/bash

echo "[bento_web] [entrypoint] setting .gitconfig"

# Set .gitconfig for development
/set_gitconfig.bash

if [[ -z "${BENTO_WEB_PORT}" ]]; then
  # Set default internal port to 80
  export BENTO_WEB_PORT=80
fi

# ----- Begin /service-info creation ----------------------------------
echo "[bento_web] [entrypoint] creating service-info file"
node ./create_service_info.js > dist/static/service-info.json
# ----- End -----------------------------------------------------------

echo "[bento_web] [entrypoint] running npm install"
npm install

echo "[bento_web] [entrypoint] starting"
npm run start

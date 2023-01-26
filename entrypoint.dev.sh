#!/bin/sh

if [ -z "${BENTO_WEB_PORT}" ]; then
  # Set default internal port to 80
  export BENTO_WEB_PORT=80
fi

# ----- Begin /service-info creation ----------------------------------
node ./create_service_info.js > dist/static/service-info.json
# ----- End -----------------------------------------------------------

npm install
npm run start

#!/bin/bash

CONFIG_FILE="dist/static/config.js"
SERVICE_INFO_FILE="dist/static/service-info.json"

echo "[bento_web] [entrypoint] creating dist/static"
mkdir -p "dist/static"

# ----- Begin instance config creation --------------------------------
echo "[bento_web] [entrypoint] writing ${CONFIG_FILE}"
node ./create_config_prod.js > "${CONFIG_FILE}"
# ----- End -----------------------------------------------------------

# ----- Begin /service-info creation ----------------------------------
echo "[bento_web] [entrypoint] writing ${SERVICE_INFO_FILE}"
node ./create_service_info.js > "${SERVICE_INFO_FILE}"
# ----- End -----------------------------------------------------------

echo "[bento_web] [entrypoint] starting NGINX"
nginx -g 'daemon off;'

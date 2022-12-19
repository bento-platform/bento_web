#!/bin/bash

CONFIG_FILE="dist/static/config.js"

echo "[bento_web] [entrypoint] creating dist/static"
mkdir -p "dist/static"

# ----- Begin instance config creation --------------------------------
echo "[bento_web] [entrypoint] writing config.js"

echo 'const BENTO_WEB_CONFIG = {' > "${CONFIG_FILE}"

if [[ -n "${BENTO_URL}" ]]; then
  echo "    BENTO_URL: '${BENTO_URL}'," >> "${CONFIG_FILE}"
fi

if [[ -n "${CUSTOM_HEADER}" ]]; then
  echo "    CUSTOM_HEADER: '${CUSTOM_HEADER}'," >> "${CONFIG_FILE}"
fi

echo '};' >> "${CONFIG_FILE}"
# ----- End -----------------------------------------------------------

echo "[bento_web] [entrypoint] starting NGINX"
nginx -g 'daemon off;'

#!/bin/bash

CONFIG_FILE="dist/static/config.js"

mkdir -p "dist/static";

# ----- Begin instance config creation --------------------------------
echo 'const BENTO_WEB_CONFIG = {' > "${CONFIG_FILE}"

if [[ -n "${BENTO_URL}" ]]; then
  echo "    BENTO_URL: '${BENTO_URL}'," >> "${CONFIG_FILE}"
fi

if [[ -n "${CUSTOM_HEADER}" ]]; then
  echo "    CUSTOM_HEADER: '${CUSTOM_HEADER}'," >> "${CONFIG_FILE}"
fi

echo '};' >> "${CONFIG_FILE}"
# ----- End -----------------------------------------------------------

nginx -g 'daemon off;'

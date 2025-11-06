#!/bin/sh
# Environment configuration script for React app
# This script injects environment variables into the built React app

# Create config file for runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_BACKEND_URL: "${REACT_APP_BACKEND_URL:-/api}",
  REACT_APP_EMERGENT_AUTH_URL: "${REACT_APP_EMERGENT_AUTH_URL:-https://auth.emergentagent.com}",
  REACT_APP_ENVIRONMENT: "${ENVIRONMENT:-production}",
  REACT_APP_VERSION: "${VERSION:-1.0.0}"
};
EOF

echo "Environment configuration injected"
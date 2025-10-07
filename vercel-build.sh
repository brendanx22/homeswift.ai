#!/bin/bash
set -e

# Set Node.js options
export NODE_OPTIONS=--openssl-legacy-provider

# Install dependencies
echo "--- Installing dependencies ---"
npm ci --prefer-offline --no-audit --progress=false

# Build the application
echo "--- Building application ---"
npm run build

# Build the chat application if not in production or if explicitly set
if [ "$VERCEL_ENV" != "production" ] || [ "$BUILD_CHAT" = "true" ]; then
  echo "--- Building chat application ---"
  npm run build:chat
fi

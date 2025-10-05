#!/bin/bash

# Exit on error
set -e

echo "--- Building Chat Application ---"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the chat application
echo "Building chat application..."
npm run build:chat

echo "--- Chat Build Complete ---"

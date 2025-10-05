#!/bin/bash

# Exit on error
set -e

echo "--- Building HomeSwift Application ---"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the application
echo "Building application..."
npm run build

echo "--- Build Complete ---"

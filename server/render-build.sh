#!/bin/bash
# Exit on any error
set -e

echo "=== Starting Build Process ==="

# Ensure we're in the server directory
echo "Current directory: $(pwd)"

# Clean up any existing node_modules to avoid conflicts
echo "Cleaning up existing dependencies..."
rm -rf node_modules package-lock.json

# Install all dependencies including devDependencies for build
echo "Installing dependencies..."
npm ci --no-audit --prefer-offline

# Verify express-validator is installed
echo "Verifying express-validator installation..."
if [ ! -d "node_modules/express-validator" ]; then
    echo "express-validator not found, installing..."
    npm install express-validator@7.0.1 --save
fi

# Run database migrations
echo "Running database migrations..."
npx sequelize-cli db:migrate

echo "=== Build completed successfully! ==="
exit 0

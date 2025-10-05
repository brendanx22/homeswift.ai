#!/bin/bash
# Exit on any error
set -e

# Set the port from the environment variable or default to 10000
export PORT=${PORT:-10000}

# Ensure required environment variables are set
if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET environment variable is not set"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "ERROR: Supabase configuration is missing"
    exit 1
fi

# Log environment information (without sensitive data)
echo "=== Environment ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "NODE_VERSION: $(node --version)"
echo "NPM_VERSION: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Node path: $(which node)"
echo "=================="

# Verify node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ERROR: node_modules directory not found. Did the build complete successfully?"
    exit 1
fi

# Verify express-validator is installed
if [ ! -d "node_modules/express-validator" ]; then
    echo "ERROR: express-validator not found in node_modules"
    exit 1
fi

# Start the server
echo "Starting server on port $PORT..."
exec node --experimental-specifier-resolution=node server.js

#!/bin/bash
# Exit on any error
set -e

# Set the port from the environment variable or use the default
PORT=${PORT:-10000}

# Start the server
echo "Starting HomeSwift backend on port $PORT..."

# Use node directly with ES modules
node --experimental-specifier-resolution=node server.js

exit 0

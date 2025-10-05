#!/bin/bash
# Exit on any error
set -e

echo "Installing dependencies..."
npm install

echo "Running database migrations..."
npx sequelize-cli db:migrate

echo "Build completed successfully!"

exit 0

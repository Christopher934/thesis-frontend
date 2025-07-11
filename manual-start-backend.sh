#!/bin/zsh
# Manual start script for backend

cd /Users/jo/Downloads/Thesis/backend

# Ensure the Prisma client is generated
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build the app with crypto polyfill
echo "Building the application..."
npm run build

# Start the app
echo "Starting the application..."
NODE_OPTIONS="--require ./dist/src/crypto-polyfill.js" npm run start:prod

# If you encounter any issues, try:
# NODE_OPTIONS="--require ./dist/src/crypto-polyfill.js" node dist/src/main.js

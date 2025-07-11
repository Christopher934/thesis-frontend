#!/bin/bash
# Script to rebuild and restart backend with Prisma and Telegram fixes

echo "🔧 Rebuilding and restarting backend with fixes..."

# Navigate to backend directory
cd /Users/jo/Downloads/Thesis/backend

# Kill any existing Node.js processes
echo "Stopping existing backend processes..."
pkill -f "node dist/src/main.js" || true
pkill -f "npm run start:prod" || true

# Clean and rebuild
echo "Cleaning and rebuilding..."
rm -rf dist/
npm run build

# Start the backend
echo "Starting backend..."
npm run start:prod

echo "Backend restart completed!"
echo "Check the terminal for any errors or issues."

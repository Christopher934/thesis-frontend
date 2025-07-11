#!/bin/bash

echo "🔧 Running backend without Docker..."
cd /Users/jo/Downloads/Thesis/backend

echo "🧹 Cleaning up any existing node processes..."
pkill -f "node.*start:dev" || true

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🔧 Building the application..."
npm run build

echo "🚀 Starting the backend..."
NODE_ENV=development npm run start:prod

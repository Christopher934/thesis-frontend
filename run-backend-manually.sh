#!/bin/bash
# Run Backend Manually script

cd /Users/jo/Downloads/Thesis/backend

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Apply migrations if needed
echo "Running migrations..."
npx prisma migrate deploy

# Build the application
echo "Building the application..."
npm run build

# Start the application
echo "Starting the backend..."
npm run start:prod

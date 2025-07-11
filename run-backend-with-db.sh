#!/bin/bash
# Complete Backend Run Script

cd /Users/jo/Downloads/Thesis

# Check if PostgreSQL container is running
echo "Checking if PostgreSQL container is running..."
if ! docker ps | grep -q rsud-postgres; then
  echo "Starting PostgreSQL container..."
  docker-compose -f docker-compose.final-fix.yml up -d postgres
  
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL to be ready..."
  sleep 10
fi

cd /Users/jo/Downloads/Thesis/backend

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building the application..."
npm run build

# Start the application
echo "Starting the backend..."
node dist/src/main.js

#!/bin/bash
# Simple manual run script

cd /Users/jo/Downloads/Thesis/backend

# Ensure PostgreSQL is running (from Docker)
echo "Checking if PostgreSQL container is running..."
if ! docker ps | grep -q rsud-postgres; then
  echo "Starting PostgreSQL container..."
  cd /Users/jo/Downloads/Thesis
  docker-compose -f docker-compose.final-fix.yml up -d postgres
  cd /Users/jo/Downloads/Thesis/backend
  
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL to be ready..."
  sleep 10
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building the application..."
npm run build

# Start the application using nest directly (this will handle the proper imports)
echo "Starting the backend with NestJS CLI..."
npx nest start

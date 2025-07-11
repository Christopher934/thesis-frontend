#!/bin/bash
# Direct run script for the backend

cd /Users/jo/Downloads/Thesis/backend

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building the application..."
npx nest build

# Start the application directly
echo "Starting the backend directly..."
node dist/src/main.js

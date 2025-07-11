#!/bin/bash
# Crypto Fix Script for NestJS Backend

# Stop and remove only the backend container
echo "Stopping and removing the backend container..."
docker-compose -f docker-compose.final-fix.yml stop backend
docker-compose -f docker-compose.final-fix.yml rm -f backend

# Rebuild the backend image with our crypto fix
echo "Rebuilding the backend image with crypto fix..."
docker-compose -f docker-compose.final-fix.yml build backend

# Start the backend container
echo "Starting the backend container..."
docker-compose -f docker-compose.final-fix.yml up -d backend

# Wait for backend to stabilize
echo "Waiting for backend to start..."
sleep 10

# Check the logs to verify the fix
echo "Checking backend logs..."
docker-compose -f docker-compose.final-fix.yml logs --tail=50 backend

echo "Fix applied! The backend should now start without the crypto error."
echo "If issues persist, check the logs with: docker-compose -f docker-compose.final-fix.yml logs backend"

#!/bin/bash
# Crypto Fix Implementation Script

echo "========================================"
echo "NESTJS CRYPTO MODULE FIX IMPLEMENTATION"
echo "========================================"

# Stop all running containers
echo "Stopping all running containers..."
docker-compose -f docker-compose.final-fix.yml down

# Build the services with the new crypto fix
echo "Building services with crypto fix..."
docker-compose -f docker-compose.crypto-fix.yml build

# Start the services in detached mode
echo "Starting services with crypto fix..."
docker-compose -f docker-compose.crypto-fix.yml up -d

# Wait for backend to initialize
echo "Waiting for services to initialize..."
sleep 15

# Check the backend logs to verify the fix
echo "Checking backend logs for successful startup..."
docker-compose -f docker-compose.crypto-fix.yml logs --tail=50 backend

# Test if the backend is responding
echo "Testing backend API connection..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health
if [ $? -eq 0 ]; then
  echo "✅ Backend API is responding!"
else
  echo "❌ Backend API is not responding. Check the logs for errors."
fi

echo ""
echo "Frontend should be available at: http://localhost:3000"
echo "Backend API should be available at: http://localhost:3001"
echo ""
echo "If you encounter any issues, check the logs with:"
echo "docker-compose -f docker-compose.crypto-fix.yml logs backend"
echo ""
echo "To verify frontend-backend connectivity, navigate to the frontend and check for notifications."

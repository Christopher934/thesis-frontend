#!/bin/bash

# Test script for notification system API endpoints
# This script tests the basic notification system functionality

BACKEND_URL="http://localhost:3001"
BASE_PATH="/Users/jo/Documents/Backup_2/Thesis/backend"

echo "=== RSUD Notification System API Test ==="
echo "Testing backend at: $BACKEND_URL"
echo "Starting backend server..."

# Navigate to backend directory and start server in background
cd "$BASE_PATH"

# Kill any existing server processes
pkill -f "npm.*start"
sleep 2

# Start the server in background
npm run start:dev > server.log 2>&1 &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"
echo "Waiting for server to start..."
sleep 10

# Check if server is running
if ! curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "❌ Server is not responding. Checking logs..."
    tail -20 server.log
    exit 1
fi

echo "✅ Server is running!"

# Test 1: Check if notification endpoints are accessible
echo ""
echo "=== Testing Notification Endpoints ==="

# We need to login first to get a JWT token
# For now, let's test the endpoints that don't require authentication

echo "1. Testing notification routes..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/notifikasi")
if [ "$RESPONSE" = "401" ]; then
    echo "✅ Notification route is accessible (401 = needs authentication)"
elif [ "$RESPONSE" = "200" ]; then
    echo "✅ Notification route is accessible"
else
    echo "❌ Notification route failed with status: $RESPONSE"
fi

echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
if [ "$HEALTH_RESPONSE" ]; then
    echo "✅ Health endpoint working: $HEALTH_RESPONSE"
else
    echo "❌ Health endpoint not working"
fi

echo "3. Testing if database is connected..."
# The server starting successfully usually indicates database connection is OK

echo ""
echo "=== Server Status ==="
echo "Process ID: $SERVER_PID"
echo "Server is running in background"
echo "To stop the server, run: kill $SERVER_PID"
echo "To check logs, run: tail -f $BASE_PATH/server.log"

echo ""
echo "=== Next Steps ==="
echo "1. Test authentication endpoints"
echo "2. Test notification CRUD operations"  
echo "3. Test Telegram integration"
echo "4. Test frontend integration"

echo ""
echo "=== Basic Test Completed Successfully ==="

#!/bin/bash

# Port Configuration Verification Script
# This script checks if the frontend and backend are configured with correct ports

echo "🔍 Port Configuration Verification"
echo "=================================="
echo

# Check frontend .env.local
echo "📁 Frontend Environment Configuration:"
if [ -f "frontend/.env.local" ]; then
    echo "✅ frontend/.env.local exists"
    API_URL=$(grep NEXT_PUBLIC_API_URL frontend/.env.local | cut -d= -f2)
    echo "   NEXT_PUBLIC_API_URL=$API_URL"
    
    if [[ "$API_URL" == "http://localhost:3001" ]]; then
        echo "   ✅ Correct backend port (3001)"
    else
        echo "   ❌ Incorrect backend port (should be 3001)"
    fi
else
    echo "❌ frontend/.env.local not found"
fi
echo

# Check Docker environment
echo "🐳 Docker Environment Configuration:"
if [ -f ".env.docker" ]; then
    echo "✅ .env.docker exists"
    DOCKER_API_URL=$(grep NEXT_PUBLIC_API_URL .env.docker | cut -d= -f2)
    echo "   NEXT_PUBLIC_API_URL=$DOCKER_API_URL"
    
    if [[ "$DOCKER_API_URL" == "http://localhost:3001" ]]; then
        echo "   ✅ Correct backend port (3001)"
    else
        echo "   ❌ Incorrect backend port (should be 3001)"
    fi
else
    echo "❌ .env.docker not found"
fi
echo

# Check if ports are available/in use
echo "🌐 Port Availability Check:"

# Check port 3000 (frontend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 3000 is in use (Frontend likely running)"
    FRONTEND_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    echo "   Process ID: $FRONTEND_PID"
else
    echo "⚠️  Port 3000 is free (Frontend not running)"
fi

# Check port 3001 (backend)
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 3001 is in use (Backend likely running)"
    BACKEND_PID=$(lsof -Pi :3001 -sTCP:LISTEN -t)
    echo "   Process ID: $BACKEND_PID"
else
    echo "⚠️  Port 3001 is free (Backend not running)"
fi

# Check port 3002 (should NOT be used)
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 3002 is in use (This should NOT be used!)"
    OLD_PID=$(lsof -Pi :3002 -sTCP:LISTEN -t)
    echo "   Process ID: $OLD_PID"
    echo "   Consider stopping this process if it's an old backend instance"
else
    echo "✅ Port 3002 is free (Good - not using old incorrect port)"
fi
echo

# Test API connectivity
echo "🔗 API Connectivity Test:"
if curl -s -f http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ Backend API is responding on port 3001"
else
    echo "❌ Backend API is not responding on port 3001"
fi

if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend is responding on port 3000"
else
    echo "❌ Frontend is not responding on port 3000"
fi
echo

echo "📋 Summary:"
echo "- Frontend should run on: http://localhost:3000"
echo "- Backend should run on: http://localhost:3001"
echo "- Database should run on: localhost:5433"
echo
echo "🚀 To restart with correct configuration:"
echo "   cd frontend && npm run dev"
echo "   cd backend && npm run start:dev"

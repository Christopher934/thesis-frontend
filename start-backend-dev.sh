#!/bin/bash
# Script to run the backend with better error handling in development mode

echo "🚀 Starting backend in development mode with enhanced error handling..."

# Navigate to backend directory
cd /Users/jo/Downloads/Thesis/backend

# Kill any existing processes
echo "Stopping existing backend processes..."
pkill -f "node dist/src/main.js" || true
pkill -f "npm run start:prod" || true
pkill -f "npm run start:dev" || true

# Wait for processes to stop
sleep 2

# Check if PostgreSQL is running
if ! nc -z localhost 5433; then
    echo "⚠️  PostgreSQL is not running on port 5433"
    echo "Please start PostgreSQL first"
    exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Apply database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "Building application..."
npm run build

# Start the application with better error handling
echo "Starting application..."
echo "📄 Logs will be written to backend.log"
nohup npm run start:prod > backend.log 2>&1 &

# Wait for startup
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if nc -z localhost 3001; then
    echo "✅ Backend is running on port 3001"
    echo "📊 Check status: curl http://localhost:3001/notifikasi"
    echo "📋 View logs: tail -f backend.log"
else
    echo "❌ Backend failed to start"
    echo "📋 Check logs: cat backend.log"
    exit 1
fi

echo "🎉 Backend started successfully!"
echo "📊 API: http://localhost:3001"
echo "📋 Logs: tail -f backend.log"

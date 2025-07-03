#!/bin/bash

# 🚀 RSUD Anugerah System Startup Script
# Quick start for thesis development and testing

echo "🏥 STARTING RSUD ANUGERAH SYSTEM"
echo "==============================="
echo ""

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=15
    local attempt=1
    
    echo "⏳ Waiting for $name to start..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s $url > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    echo "❌ $name failed to start"
    return 1
}

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
sleep 3

# Start Backend
echo "🔧 Starting Backend (NestJS + Telegram Bot)..."
cd backend
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start Frontend  
echo "🌐 Starting Frontend (Next.js)..."
cd frontend
npm run dev:stable > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait for services to start
echo ""
echo "⏳ Starting services..."
sleep 5

# Check backend
if wait_for_service "http://localhost:3001/telegram/bot-info" "Backend + Telegram Bot"; then
    echo "   🤖 Telegram Bot: Active with Long Polling"
else
    echo "   ❌ Backend startup failed"
fi

# Check frontend
if wait_for_service "http://localhost:3000" "Frontend"; then
    echo "   🌐 Frontend: Ready for development"
else
    echo "   ❌ Frontend startup failed"
fi

echo ""
echo "🎯 SYSTEM STATUS:"
echo "================="
check_port 3001 && echo "✅ Backend: http://localhost:3001" || echo "❌ Backend: Not running"
check_port 3000 && echo "✅ Frontend: http://localhost:3000" || echo "❌ Frontend: Not running"

echo ""
echo "🤖 TELEGRAM BOT:"
echo "================"
echo "Bot Username: @rsud_anugerah_notif_bot"
echo "Commands: /start, /help, /myid, /status"

echo ""
echo "📊 PROCESS IDs:"
echo "==============="
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "📝 LOGS:"
echo "========"
echo "Backend logs: tail -f logs/backend.log"
echo "Frontend logs: tail -f logs/frontend.log"

echo ""
echo "🛑 TO STOP:"
echo "==========="
echo "kill $BACKEND_PID $FRONTEND_PID"
echo "or"
echo "pkill -f \"next dev\" && pkill -f \"nest start\""

echo ""
echo "🎉 SYSTEM READY FOR THESIS DEVELOPMENT!"
echo "======================================="

#!/bin/bash

# Full System Integration Test
# Tests frontend startup, backend, and Telegram bot functionality

echo "🚀 Starting Full System Integration Test..."
echo "========================================"

# Function to check if port is in use
check_port() {
    local port=$1
    lsof -ti:$port > /dev/null 2>&1
}

# Function to wait for service to start
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to start..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s $url > /dev/null 2>&1; then
            echo "✅ $service_name is responding"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within timeout"
    return 1
}

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
sleep 3

# Test 1: Backend with Telegram Bot
echo ""
echo "📡 Test 1: Starting Backend with Telegram Bot..."
cd /Users/jo/Documents/Backup_2/Thesis/backend

# Start backend in background
nohup npm run start:dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
if wait_for_service "http://localhost:8080/health" "Backend"; then
    echo "✅ Backend startup successful"
    
    # Check Telegram bot logs
    echo "🤖 Checking Telegram Bot initialization..."
    sleep 5
    if grep -q "Bot initialized" backend.log; then
        echo "✅ Telegram Bot initialized successfully"
    else
        echo "⚠️  Telegram Bot initialization not detected in logs"
    fi
    
    # Show relevant log lines
    echo "📋 Recent backend logs:"
    tail -10 backend.log | grep -E "(Bot|Telegram|✅|❌|🤖)" || echo "No bot-related logs found"
else
    echo "❌ Backend failed to start"
fi

# Test 2: Frontend
echo ""
echo "🌐 Test 2: Starting Frontend..."
cd /Users/jo/Documents/Backup_2/Thesis/frontend

# Start frontend in background
nohup npm run dev:stable > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
if wait_for_service "http://localhost:3000" "Frontend"; then
    echo "✅ Frontend startup successful"
    
    # Check for compilation errors
    if grep -q "Error" frontend.log; then
        echo "⚠️  Compilation errors detected:"
        grep "Error" frontend.log | head -5
    else
        echo "✅ No compilation errors detected"
    fi
else
    echo "❌ Frontend failed to start"
fi

# Test 3: Integration Check
echo ""
echo "🔗 Test 3: Integration Health Check..."

# Check if both services are running
if check_port 8080 && check_port 3000; then
    echo "✅ Both services are running on their respective ports"
    
    # Test API connectivity from frontend context
    echo "🔄 Testing API connectivity..."
    if curl -s "http://localhost:8080/api" > /dev/null 2>&1; then
        echo "✅ API endpoint is accessible"
    else
        echo "⚠️  API endpoint test failed"
    fi
    
else
    echo "❌ One or both services are not running properly"
fi

# Summary
echo ""
echo "📊 SYSTEM STATUS SUMMARY"
echo "========================"
echo "Backend (Port 8080): $(check_port 8080 && echo "✅ Running" || echo "❌ Not Running")"
echo "Frontend (Port 3000): $(check_port 3000 && echo "✅ Running" || echo "❌ Not Running")"

# Check Telegram bot status from logs
if [ -f backend.log ] && grep -q "long polling" backend.log; then
    echo "Telegram Bot: ✅ Active (Long Polling)"
else
    echo "Telegram Bot: ⚠️  Status Unknown"
fi

echo ""
echo "🎯 To continue development:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo "   Backend Logs: tail -f backend/backend.log"
echo "   Frontend Logs: tail -f frontend/frontend.log"

echo ""
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"

echo ""
echo "✨ System integration test completed!"

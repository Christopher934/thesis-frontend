#!/bin/bash
# Complete startup script for RSUD Anugerah system

echo "🏥 RSUD Anugerah System Startup"
echo "==============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL..."
if nc -z localhost 5433 2>/dev/null; then
    print_status "PostgreSQL is running on port 5433"
else
    print_error "PostgreSQL is not running on port 5433"
    echo "   Please start PostgreSQL first"
    exit 1
fi

# Kill existing processes
echo "2. Stopping existing processes..."
pkill -f "node dist/src/main.js" 2>/dev/null || true
pkill -f "npm run start:prod" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Start Backend
echo "3. Starting Backend..."
cd /Users/jo/Downloads/Thesis/backend

# Generate Prisma client
print_info "Generating Prisma client..."
npx prisma generate >/dev/null 2>&1

# Build backend
print_info "Building backend..."
npm run build >/dev/null 2>&1

# Start backend in new terminal
print_info "Starting backend in new terminal window..."
osascript -e 'tell app "Terminal" to do script "cd /Users/jo/Downloads/Thesis/backend && npm run start:prod"'

# Wait for backend to start
print_info "Waiting for backend to start..."
sleep 10

# Check if backend is running
if nc -z localhost 3001 2>/dev/null; then
    print_status "Backend is running on port 3001"
else
    print_error "Backend failed to start"
    echo "   Check the terminal window for errors"
    exit 1
fi

# Start Frontend
echo "4. Starting Frontend..."
cd /Users/jo/Downloads/Thesis/frontend

print_info "Starting frontend in new terminal window..."
osascript -e 'tell app "Terminal" to do script "cd /Users/jo/Downloads/Thesis/frontend && npm run dev"'

# Wait for frontend to start
print_info "Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if nc -z localhost 3000 2>/dev/null; then
    print_status "Frontend is running on port 3000"
else
    print_error "Frontend failed to start"
    echo "   Check the terminal window for errors"
fi

echo ""
echo "🎉 System Startup Complete!"
echo "=========================="
print_status "Backend API: http://localhost:3001"
print_status "Frontend App: http://localhost:3000"
print_status "Database: PostgreSQL on port 5433"

echo ""
echo "📋 What's Fixed:"
echo "• Prisma validation errors (take/skip parameters)"
echo "• Telegram bot network error spam"
echo "• Improved error handling"

echo ""
echo "🔧 If you see any issues:"
echo "• Check the terminal windows for detailed logs"
echo "• Telegram bot network errors are now handled gracefully"
echo "• Database connection issues will be clearly reported"

echo ""
print_info "System is ready for use! 🚀"

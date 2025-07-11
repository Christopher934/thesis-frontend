#!/bin/bash

echo "🚀 Manual Start Script for RSUD Anugerah System"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
print_status "Checking PostgreSQL status..."
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    print_success "PostgreSQL is running ✓"
else
    print_error "PostgreSQL is not running. Please start PostgreSQL and try again."
    exit 1
fi

# Kill any existing processes
print_status "Cleaning up existing processes..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

print_success "Cleanup completed ✓"

# Start Backend
print_status "Starting Backend Server..."
cd /Users/jo/Downloads/Thesis/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Start backend in background
print_status "Starting backend on port 3001..."
npm run start:dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_success "Backend started with PID $BACKEND_PID ✓"
else
    print_error "Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start Frontend
print_status "Starting Frontend Server..."
cd /Users/jo/Downloads/Thesis/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
print_status "Starting frontend on port 3000..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 5

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    print_success "Frontend started with PID $FRONTEND_PID ✓"
else
    print_error "Frontend failed to start. Check frontend.log for details."
    exit 1
fi

print_success "🎉 System started successfully!"
echo ""
echo "📋 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📝 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📊 Log files:"
echo "   Backend:  /Users/jo/Downloads/Thesis/backend/backend.log"
echo "   Frontend: /Users/jo/Downloads/Thesis/frontend/frontend.log"
echo ""
echo "⏹️  To stop the system:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🔍 To monitor logs:"
echo "   Backend:  tail -f /Users/jo/Downloads/Thesis/backend/backend.log"
echo "   Frontend: tail -f /Users/jo/Downloads/Thesis/frontend/frontend.log"

# Keep script running and monitor processes
print_status "Monitoring system... Press Ctrl+C to stop all services."

cleanup() {
    print_warning "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    print_success "All services stopped."
    exit 0
}

trap cleanup INT

# Monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend process died!"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend process died!"
        break
    fi
    sleep 5
done

cleanup

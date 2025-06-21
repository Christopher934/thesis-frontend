#!/bin/bash

# 🚀 Fast Development Startup - Bypass Frontend Docker Build
# This script starts backend services in Docker and frontend locally for fastest development

echo "🏥 RSUD Anugerah - Fast Development Mode"
echo "Backend in Docker + Frontend Local = Fastest Development Experience"
echo ""

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

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

print_success "Docker is running ✓"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker compose down 2>/dev/null

# Start only backend services (PostgreSQL + Backend)
print_status "Starting backend services (PostgreSQL + NestJS)..."
docker compose up -d postgres backend

# Wait for backend to be ready
print_status "Waiting for backend services to be ready..."
sleep 10

# Check backend services
if docker compose ps postgres | grep -q "Up"; then
    print_success "PostgreSQL is running ✓"
else
    print_error "PostgreSQL failed to start"
    docker compose logs postgres
    exit 1
fi

if docker compose ps backend | grep -q "Up"; then
    print_success "Backend is running ✓"
else
    print_warning "Backend is starting... (this may take 2-3 minutes)"
    print_status "You can check progress with: docker compose logs -f backend"
fi

echo ""
print_success "🎉 Backend services are ready!"
echo ""
echo "📊 Next Steps:"
echo "   1. Open a new terminal"
echo "   2. Run: cd frontend"
echo "   3. Run: npm install (if needed)"
echo "   4. Run: npm run dev"
echo ""
echo "📱 Access Points:"
echo "   🌐 Frontend:  http://localhost:3000 (when you start it locally)"
echo "   🔧 Backend:   http://localhost:3001"
echo "   📋 API Docs:  http://localhost:3001/api/docs"
echo "   🗄️  Database: localhost:5433"
echo ""
echo "📝 Useful Commands:"
echo "   🔍 Backend status: docker compose ps"
echo "   📄 Backend logs:   docker compose logs -f backend"
echo "   🛑 Stop backend:   docker compose down"
echo ""
print_warning "This approach skips the slow frontend Docker build completely!"
print_status "Frontend will have hot reload and instant changes when run locally."

# Optional: Automatically start frontend if requested
if [ "$1" = "--start-frontend" ]; then
    print_status "Starting frontend locally..."
    if [ -d "frontend" ]; then
        cd frontend
        if [ ! -d "node_modules" ]; then
            print_status "Installing frontend dependencies..."
            npm install
        fi
        print_success "Starting frontend with hot reload..."
        npm run dev
    else
        print_error "Frontend directory not found"
    fi
fi

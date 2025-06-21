#!/bin/bash

# 🚀 RSUD Anugerah Quick Start Script

echo "🏥 Starting RSUD Anugerah Hospital Management System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

print_success "Docker Compose configuration found ✓"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating default configuration..."
    cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=rsud_anugerah
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Backend Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    print_success "Default .env file created ✓"
fi

# Check startup mode
if [ "$1" = "--logs" ]; then
    print_status "Starting with live logs (press Ctrl+C to stop)..."
    docker compose up
elif [ "$1" = "--build" ]; then
    print_status "Rebuilding all containers..."
    docker compose build --no-cache
    docker compose up -d
    print_success "Containers rebuilt and started ✓"
elif [ "$1" = "--fast" ]; then
    print_status "Starting in FAST development mode (backend in Docker, frontend local)..."
    print_warning "This skips the slow frontend Docker build!"
    docker compose down 2>/dev/null
    docker compose up -d postgres backend
    sleep 5
    echo ""
    print_success "🚀 Backend services ready!"
    print_status "Next: Open new terminal and run: cd frontend && npm run dev"
    print_status "Frontend will have instant hot reload when run locally."
    echo ""
elif [ "$1" = "--backend-only" ]; then
    print_status "Starting backend services only (PostgreSQL + NestJS)..."
    docker compose down 2>/dev/null
    docker compose up -d postgres backend
    print_success "Backend services started ✓"
elif [ "$1" = "--dev" ]; then
    print_status "Starting in development mode..."
    if [ -f "docker-compose.dev.yml" ]; then
        docker compose -f docker-compose.dev.yml up -d
    else
        print_warning "No development compose file found, using production mode..."
        docker compose up -d
    fi
else
    print_status "Starting all containers in background..."
    docker compose up -d
fi

if [ "$1" != "--logs" ]; then
    echo ""
    print_status "Checking container status..."
    sleep 3
    docker compose ps
    
    echo ""
    print_success "🎉 RSUD Anugerah system is starting!"
    echo ""
    echo "📊 Access Points:"
    echo "   🌐 Frontend:  http://localhost:3000"
    echo "   🔧 Backend:   http://localhost:3001"
    echo "   📋 API Docs:  http://localhost:3001/api/docs"
    echo "   🗄️  Database: localhost:5433"
    echo ""
    echo "📝 Startup Options:"
    echo "   ⚡ Fast mode:     ./start-app.sh --fast"
    echo "   🔧 Backend only: ./start-app.sh --backend-only"
    echo "   📋 With logs:    ./start-app.sh --logs"
    echo "   🔄 Rebuild:      ./start-app.sh --build"
    echo "   🏗️  Full Docker: ./start-app.sh"
    echo ""
    echo "📝 Useful Commands:"
    echo "   🔍 Check status: docker compose ps"
    echo "   📄 View logs:    docker compose logs -f"
    echo "   🛑 Stop all:     docker compose down"
    echo "   🔄 Restart:      docker compose restart [service]"
    echo ""
    if [ "$1" = "--fast" ] || [ "$1" = "--backend-only" ]; then
        print_warning "Frontend not started in Docker. Run locally: cd frontend && npm run dev"
    else
        print_warning "Note: First startup may take 5-15 minutes for frontend build."
    fi
    print_status "Use 'docker compose logs -f' to monitor progress."
fi

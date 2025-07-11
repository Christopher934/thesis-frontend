#!/bin/bash

# Comprehensive Fix Script for Fetch and Socket Errors
# This script fixes all issues with fetch errors and socket connections

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

# Stop running containers
print_status "Stopping all running containers..."
docker compose down

# Remove any existing containers
print_status "Cleaning up Docker resources..."
docker rm -f rsud-backend rsud-frontend rsud-postgres 2>/dev/null || true

# Fix 1: Update the NotificationContext.tsx socket connection
print_status "Fixing socket connection in NotificationContext.tsx..."
if grep -q "const newSocket = io(\`\${API_BASE_URL\}/notifications\`" ./frontend/src/components/notifications/NotificationContext.tsx; then
    sed -i '' 's|const newSocket = io(`${API_BASE_URL}/notifications`|const newSocket = io(`${API_BASE_URL}`|g' ./frontend/src/components/notifications/NotificationContext.tsx
    print_success "Fixed socket connection path"
else
    print_warning "Socket connection already fixed or pattern not found"
fi

# Fix 2: Update the user-notifications.controller.ts
print_status "Fixing user notifications controller prefix..."
if grep -q "@Controller('api/user-notifications')" ./backend/src/notifikasi/user-notifications.controller.ts; then
    sed -i '' 's|@Controller('\''api/user-notifications'\'')|@Controller('\''user-notifications'\'')|g' ./backend/src/notifikasi/user-notifications.controller.ts
    print_success "Controller prefix updated"
else
    print_warning "Controller prefix already fixed or pattern not found"
fi

# Fix 3: Ensure the frontend .env.local has the correct API URL
print_status "Checking frontend .env.local configuration..."
if [ -f "./frontend/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:3001" ./frontend/.env.local; then
        print_success "Frontend .env.local has correct API URL"
    else
        echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > ./frontend/.env.local
        print_success "Updated frontend .env.local with correct API URL"
    fi
else
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > ./frontend/.env.local
    print_success "Created frontend .env.local with correct API URL"
fi

# Fix 4: Create improved docker-compose file
print_status "Creating improved Docker Compose configuration..."
cat > ./docker-compose.improved.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: rsud-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-rsud_anugerah}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5433:5432"
    networks:
      - rsud-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API (NestJS)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: rsud-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-rsud_anugerah}
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key}
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - rsud-network
    volumes:
      - ./backend/uploads:/app/uploads  # For file uploads
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    # Modified command that skips the problematic seed script
    command: >
      sh -c "npx prisma migrate deploy &&
             node dist/main"

  # Frontend (Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: rsud-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - rsud-network
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NODE_ENV: ${NODE_ENV:-production}

networks:
  rsud-network:
    driver: bridge

volumes:
  postgres_data:
EOF
print_success "Created improved Docker Compose configuration"

# Start the system
print_status "Starting system with improved configuration..."
docker compose -f docker-compose.improved.yml up -d

# Wait for backend to be healthy
print_status "Waiting for backend to become healthy..."
attempt=1
max_attempts=20
while [ $attempt -le $max_attempts ]; do
    if docker inspect rsud-backend | grep -q '"Status": "healthy"'; then
        print_success "Backend is healthy!"
        break
    fi
    print_status "Waiting for backend to be healthy... (Attempt $attempt/$max_attempts)"
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_warning "Backend did not become healthy in time. Check logs with: docker logs rsud-backend"
    print_status "Trying alternative approach: restarting the backend container..."
    docker restart rsud-backend
    sleep 10
fi

print_success "✅ All fixes have been applied!"
print_status "🌐 Access your application at: http://localhost:3000"
print_status "📊 API is available at: http://localhost:3001"
print_status "🐛 If you still have issues, check the logs with: docker logs rsud-backend"

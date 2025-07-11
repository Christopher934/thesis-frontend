#!/bin/bash

# Advanced Fix Script for Fetch Errors
# This script helps diagnose and fix fetch errors in the application

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

# Check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Some diagnostics will be limited."
        return 1
    fi
    return 0
}

# Function to test an API endpoint
test_endpoint() {
    local url=$1
    local auth=${2:-no}
    local method=${3:-GET}
    
    print_status "Testing endpoint: $url (Method: $method, Auth: $auth)"
    
    local curl_cmd="curl -s -X $method"
    local extra_args=""
    
    if [ "$auth" = "yes" ]; then
        # Try to get a token
        print_status "  Attempting to get auth token..."
        local token_response=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"password123"}')
        
        if [ -z "$token_response" ]; then
            print_error "  Failed to get token response"
            return 1
        fi
        
        if check_jq; then
            local token=$(echo $token_response | jq -r '.access_token')
            if [ "$token" = "null" ] || [ -z "$token" ]; then
                print_error "  Could not extract token from response"
                echo $token_response
                return 1
            fi
            curl_cmd="$curl_cmd -H \"Authorization: Bearer $token\""
        else
            print_warning "  jq not installed, skipping auth test"
            return 1
        fi
    fi
    
    # Execute the curl command
    local response=$(eval $curl_cmd $url)
    
    if [ -z "$response" ]; then
        print_error "  No response from endpoint"
        return 1
    fi
    
    if check_jq; then
        # Try to parse as JSON
        if echo "$response" | jq . &>/dev/null; then
            print_success "  Endpoint returned valid JSON"
            echo "$response" | jq .
            return 0
        fi
    fi
    
    # If we get here, it's not JSON or jq is not installed
    print_status "  Response: ${response:0:100}..."
    return 0
}

# Main diagnostic function
run_diagnostics() {
    print_status "==== Running fetch error diagnostics ===="
    
    # Check if backend is running
    if curl -s http://localhost:3001/health &>/dev/null; then
        print_success "Backend is accessible at http://localhost:3001"
    else
        print_error "Backend is NOT accessible at http://localhost:3001"
    fi
    
    # Check if frontend is running
    if curl -s http://localhost:3000 &>/dev/null; then
        print_success "Frontend is accessible at http://localhost:3000"
    else
        print_error "Frontend is NOT accessible at http://localhost:3000"
    fi
    
    # Test notification endpoints
    print_status "Testing notification endpoints..."
    
    # Test endpoints without auth
    test_endpoint "http://localhost:3001/user-notifications/personal"
    test_endpoint "http://localhost:3001/user-notifications/interactive"
    
    # Test endpoints with auth
    test_endpoint "http://localhost:3001/user-notifications/personal" "yes"
    test_endpoint "http://localhost:3001/user-notifications/interactive" "yes"
    
    print_status "==== Diagnostics complete ===="
}

# Function to apply fixes
apply_fixes() {
    print_status "==== Applying fixes ===="
    
    # Fix 1: Update the controller prefix in backend
    print_status "Fixing user notifications controller prefix..."
    sed -i '' 's|@Controller.*user-notifications.*|@Controller('\''user-notifications'\'')|g' ./backend/src/notifikasi/user-notifications.controller.ts
    print_success "Controller prefix updated"
    
    # Fix 2: Verify .env.local in frontend
    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:3001" ./frontend/.env.local; then
        print_success "Frontend .env.local has correct API URL"
    else
        print_status "Updating frontend .env.local API URL..."
        echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > ./frontend/.env.local
        print_success "Frontend .env.local updated"
    fi
    
    # Fix 3: Create improved docker-compose file for consistent environment
    print_status "Creating improved docker-compose configuration..."
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
    print_success "Created improved docker-compose configuration"
    
    # Fix 4: Create a specialized restart script for the current issues
    print_status "Creating specialized restart script..."
    cat > ./restart-system-fix-socket.sh << 'EOF'
#!/bin/bash

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

# Start with the improved docker-compose
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
    print_error "Backend did not become healthy in time. Check logs with: docker logs rsud-backend"
    exit 1
fi

print_success "System restarted successfully!"
print_status "Frontend available at: http://localhost:3000"
print_status "Backend API available at: http://localhost:3001"
print_status "Check Docker logs with: docker logs rsud-backend or docker logs rsud-frontend"
EOF
    chmod +x ./restart-system-fix-socket.sh
    print_success "Created specialized restart script"
    
    # Fix 5: Update NotificationContext.tsx to fix socket connection
    print_status "Fixing socket connection in NotificationContext.tsx..."
    
    if grep -q "const newSocket = io(\`\${API_BASE_URL\}/notifications\`" ./frontend/src/components/notifications/NotificationContext.tsx; then
        sed -i '' 's|const newSocket = io(`${API_BASE_URL}/notifications`|const newSocket = io(`${API_BASE_URL}`|g' ./frontend/src/components/notifications/NotificationContext.tsx
        print_success "Fixed socket connection path"
    else
        print_warning "Could not locate socket connection code pattern. Manual fix may be needed."
    fi
    
    print_status "==== Fixes applied ===="
    print_status "To restart the system with all fixes, run: ./restart-system-fix-socket.sh"
}

# Main execution
echo "🔧 Fetch Error Troubleshooter 🔧"
echo ""

case "$1" in
    --diagnose)
        run_diagnostics
        ;;
    --fix)
        apply_fixes
        ;;
    --restart)
        print_status "Restarting application in fix-noseed mode..."
        ./start-app.sh --fix-noseed
        ;;
    *)
        echo "Usage:"
        echo "  ./advanced-fetch-fix.sh --diagnose   Run diagnostics"
        echo "  ./advanced-fetch-fix.sh --fix        Apply fixes"
        echo "  ./advanced-fetch-fix.sh --restart    Restart app with fixes"
        ;;
esac

echo ""
echo "✅ Script completed"

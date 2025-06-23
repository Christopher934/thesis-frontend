#!/bin/bash

# RSUD Anugerah Notification System Test Script
# Comprehensive testing untuk semua komponen notifikasi

echo "🧪 RSUD Anugerah Notification System Testing"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Function to check if service is running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not running${NC}"
        return 1
    fi
}

# Check if both services are running
echo -e "${BLUE}📡 Checking Services Status...${NC}"
check_service "$BASE_URL/api" "Backend API"
BACKEND_STATUS=$?

check_service "$FRONTEND_URL" "Frontend"
FRONTEND_STATUS=$?

if [ $BACKEND_STATUS -ne 0 ] || [ $FRONTEND_STATUS -ne 0 ]; then
    echo -e "${RED}⚠️  Please start both backend and frontend services first${NC}"
    echo ""
    echo "To start backend: cd backend && npm run start:dev"
    echo "To start frontend: cd frontend && npm run dev"
    exit 1
fi

echo ""

# Get JWT token for testing
echo -e "${BLUE}🔐 Getting JWT Token for Testing...${NC}"
TOKEN=""

# Try to get token from a test login (you may need to adjust this)
echo "Please provide a valid JWT token for testing:"
echo "(You can get this by logging into the frontend and checking localStorage)"
read -p "JWT Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No token provided. Some tests will be skipped.${NC}"
else
    echo -e "${GREEN}✅ Token received${NC}"
fi

echo ""

# Test 1: Backend Health Check
echo -e "${BLUE}🏥 Test 1: Backend Health Check${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$response" -eq 200 ] || [ "$response" -eq 404 ]; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $response)${NC}"
fi

echo ""

# Test 2: Notification API Endpoints
if [ ! -z "$TOKEN" ]; then
    echo -e "${BLUE}📱 Test 2: Notification API Endpoints${NC}"
    
    # Test get notifications
    echo "Testing GET /notifikasi..."
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$BASE_URL/notifikasi")
    http_code=$(echo "$response" | tail -c 4)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ GET notifications endpoint working${NC}"
    else
        echo -e "${RED}❌ GET notifications failed (HTTP $http_code)${NC}"
    fi
    
    # Test unread count
    echo "Testing GET /notifikasi/unread-count..."
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$BASE_URL/notifikasi/unread-count")
    http_code=$(echo "$response" | tail -c 4)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ GET unread count endpoint working${NC}"
    else
        echo -e "${RED}❌ GET unread count failed (HTTP $http_code)${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping notification API tests (no token)${NC}"
fi

echo ""

# Test 3: Telegram Bot Configuration
echo -e "${BLUE}🤖 Test 3: Telegram Bot Configuration${NC}"

# Check if bot token is configured
if [ ! -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${GREEN}✅ TELEGRAM_BOT_TOKEN environment variable is set${NC}"
    
    # Test bot info
    echo "Testing Telegram bot info..."
    response=$(curl -s -w "%{http_code}" "$BASE_URL/telegram/bot-info")
    http_code=$(echo "$response" | tail -c 4)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Telegram bot info endpoint working${NC}"
    else
        echo -e "${RED}❌ Telegram bot info failed (HTTP $http_code)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  TELEGRAM_BOT_TOKEN not set in environment${NC}"
    echo "To configure:"
    echo "1. Create bot with @BotFather"
    echo "2. Add TELEGRAM_BOT_TOKEN to backend/.env"
    echo "3. Restart backend"
fi

echo ""

# Test 4: WebSocket Connection
echo -e "${BLUE}🔌 Test 4: WebSocket Connection${NC}"
echo "Testing WebSocket notification endpoint..."

# Simple WebSocket connection test
if command -v wscat &> /dev/null; then
    echo "Testing WebSocket connection (requires wscat)..."
    timeout 5s wscat -c "ws://localhost:3001/notifications" --auth "$TOKEN" || echo -e "${YELLOW}⚠️  WebSocket test requires wscat (npm install -g wscat)${NC}"
else
    echo -e "${YELLOW}⚠️  WebSocket test skipped (wscat not installed)${NC}"
    echo "Install with: npm install -g wscat"
fi

echo ""

# Test 5: Frontend Integration
echo -e "${BLUE}🌐 Test 5: Frontend Integration${NC}"
echo "Checking frontend notification components..."

# Check if notification files exist
NOTIFICATION_FILES=(
    "src/components/notifications/NotificationContext.tsx"
    "src/components/notifications/NotificationBell.tsx"
    "src/components/notifications/NotificationDropdown.tsx"
    "src/components/notifications/NotificationCenter.tsx"
)

all_files_exist=true
for file in "${NOTIFICATION_FILES[@]}"; do
    if [ -f "../frontend/$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        all_files_exist=false
    fi
done

if $all_files_exist; then
    echo -e "${GREEN}✅ All notification components are present${NC}"
else
    echo -e "${RED}❌ Some notification components are missing${NC}"
fi

echo ""

# Test 6: Database Schema
echo -e "${BLUE}🗄️  Test 6: Database Schema${NC}"
echo "Checking notification tables in database..."

# This would require database access, so we'll check via API
if [ ! -z "$TOKEN" ]; then
    # Try to create a test notification
    echo "Testing notification creation..."
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"userId": 1, "judul": "Test Notification", "pesan": "This is a test notification", "jenis": "SISTEM_INFO"}' \
        "$BASE_URL/notifikasi")
    
    http_code=$(echo "$response" | tail -c 4)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ Notification creation working (database schema OK)${NC}"
    else
        echo -e "${RED}❌ Notification creation failed (HTTP $http_code)${NC}"
        echo "Check database schema and migrations"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping database test (no token)${NC}"
fi

echo ""

# Test Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=============="

# Recommendations
echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "1. 🤖 Setup Telegram Bot:"
echo "   - Create bot with @BotFather"
echo "   - Add token to backend/.env"
echo "   - Test with /setup-commands endpoint"
echo ""
echo "2. 👤 Test User Profile:"
echo "   - Login to frontend"
echo "   - Go to Profile page"
echo "   - Add Telegram Chat ID"
echo ""
echo "3. 🔔 Test Real Notifications:"
echo "   - Create test shift"
echo "   - Check CRON job notifications"
echo "   - Verify WebSocket real-time updates"
echo ""
echo "4. 📱 Production Deployment:"
echo "   - Setup webhook for Telegram bot"
echo "   - Configure environment variables"
echo "   - Test in production environment"

echo ""
echo -e "${GREEN}🎉 Notification System Testing Complete!${NC}"

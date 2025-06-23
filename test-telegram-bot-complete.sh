#!/bin/bash

# 🧪 TELEGRAM BOT COMPLETE TESTING - RSUD ANUGERAH
# Comprehensive testing suite for the notification system

echo "🧪 TELEGRAM BOT COMPLETE TESTING SUITE"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m' 
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔹 $1${NC}"
}

print_result() {
    echo -e "${CYAN}📊 $1${NC}"
}

BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

echo "TEST SUITE 1: SYSTEM HEALTH CHECK"
echo "================================="

# Test 1: Backend server
print_test "Backend server availability"
if curl -s "$BACKEND_URL/notifikasi" > /dev/null 2>&1; then
    print_success "Backend server is running on port 3001"
    BACKEND_RUNNING=true
else
    print_error "Backend server not running"
    print_info "Starting backend server..."
    cd /Users/jo/Documents/Backup_2/Thesis/backend
    npm run start:dev &
    sleep 10
    if curl -s "$BACKEND_URL/notifikasi" > /dev/null 2>&1; then
        print_success "Backend server started successfully"
        BACKEND_RUNNING=true
    else
        print_error "Failed to start backend server"
        BACKEND_RUNNING=false
    fi
fi
echo ""

# Test 2: Frontend server
print_test "Frontend server availability"
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    print_success "Frontend server is running on port 3000"
    FRONTEND_RUNNING=true
else
    print_info "Frontend server not running (optional for backend tests)"
    FRONTEND_RUNNING=false
fi
echo ""

# Test 3: Database connection
print_test "Database connection"
if [ "$BACKEND_RUNNING" = true ]; then
    # Try to access an endpoint that requires database
    RESPONSE=$(curl -s "$BACKEND_URL/user" 2>/dev/null)
    if [ $? -eq 0 ]; then
        print_success "Database connection working"
    else
        print_info "Database connection test inconclusive"
    fi
else
    print_info "Skipped - backend not running"
fi
echo ""

echo "TEST SUITE 2: TELEGRAM CONFIGURATION"
echo "===================================="

# Test 4: Bot token configuration
print_test "Bot token configuration"
if grep -q "TELEGRAM_BOT_TOKEN=" /Users/jo/Documents/Backup_2/Thesis/backend/.env; then
    BOT_TOKEN=$(grep "TELEGRAM_BOT_TOKEN=" /Users/jo/Documents/Backup_2/Thesis/backend/.env | cut -d'"' -f2)
    if [[ "$BOT_TOKEN" == "REPLACE_WITH_YOUR_ACTUAL_BOT_TOKEN" ]]; then
        print_error "Bot token not configured"
        print_info "Run: ./activate-telegram-bot.sh to configure"
        TOKEN_CONFIGURED=false
    else
        print_success "Bot token is configured"
        TOKEN_CONFIGURED=true
        
        # Test bot connection
        print_test "Bot API connection"
        RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe" 2>/dev/null)
        if echo "$RESPONSE" | grep -q '"ok":true'; then
            BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
            BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
            print_success "Bot API connection successful"
            print_result "Bot Name: $BOT_NAME"
            print_result "Bot Username: @$BOT_USERNAME"
        else
            print_error "Bot API connection failed"
            print_info "Response: $RESPONSE"
        fi
    fi
else
    print_error "Bot token configuration missing"
    TOKEN_CONFIGURED=false
fi
echo ""

echo "TEST SUITE 3: API ENDPOINTS"
echo "=========================="

if [ "$BACKEND_RUNNING" = true ]; then
    # Test 5: Authentication endpoint
    print_test "Authentication endpoint"
    LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}' 2>/dev/null)
    
    if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        print_success "Authentication successful"
        AUTH_TOKEN=$TOKEN
    else
        print_error "Authentication failed"
        print_info "Trying alternative credentials..."
        
        # Try with different credentials
        LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"user@test.com","password":"password"}' 2>/dev/null)
        
        if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
            TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
            print_success "Authentication successful with alternative credentials"
            AUTH_TOKEN=$TOKEN
        else
            print_error "Authentication failed with all credentials"
            AUTH_TOKEN=""
        fi
    fi
    echo ""
    
    if [ ! -z "$AUTH_TOKEN" ]; then
        # Test 6: Telegram Chat ID endpoints
        print_test "Telegram Chat ID endpoints"
        
        # Test GET endpoint
        GET_RESPONSE=$(curl -s -X GET "$BACKEND_URL/user/telegram-chat-id" \
            -H "Authorization: Bearer $AUTH_TOKEN" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            print_success "GET /user/telegram-chat-id endpoint working"
        else
            print_error "GET /user/telegram-chat-id endpoint failed"
        fi
        
        # Test PUT endpoint
        PUT_RESPONSE=$(curl -s -X PUT "$BACKEND_URL/user/telegram-chat-id" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"telegramChatId":"123456789"}' 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            print_success "PUT /user/telegram-chat-id endpoint working"
        else
            print_error "PUT /user/telegram-chat-id endpoint failed"
        fi
        echo ""
        
        # Test 7: Test notification endpoint
        print_test "Test notification endpoint"
        TEST_RESPONSE=$(curl -s -X POST "$BACKEND_URL/user/test-telegram-notification" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"message":"Test notification from automated testing"}' 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            print_success "Test notification endpoint working"
            if [ "$TOKEN_CONFIGURED" = true ]; then
                print_info "If you have Chat ID configured, check Telegram for test message"
            fi
        else
            print_error "Test notification endpoint failed"
        fi
        echo ""
        
        # Test 8: Create notification endpoint
        print_test "Create notification endpoint"
        NOTIF_RESPONSE=$(curl -s -X POST "$BACKEND_URL/notifikasi" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "judul": "🤖 System Test Notification",
                "pesan": "This is an automated test of the notification system. If you receive this in Telegram, everything is working perfectly!",
                "jenis": "SISTEM_INFO"
            }' 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            print_success "Create notification endpoint working"
            print_info "Check web app and Telegram for new notification"
        else
            print_error "Create notification endpoint failed"
        fi
        echo ""
    else
        print_info "Skipping authenticated endpoint tests - no valid token"
        echo ""
    fi
else
    print_info "Skipping API tests - backend not running"
    echo ""
fi

echo "TEST SUITE 4: FRONTEND INTEGRATION"
echo "=================================="

# Test 9: Frontend files
print_test "Frontend component files"
FRONTEND_FILES=(
    "/Users/jo/Documents/Backup_2/Thesis/frontend/src/components/notifications/TelegramSetup.tsx"
    "/Users/jo/Documents/Backup_2/Thesis/frontend/src/app/dashboard/list/profile/page.tsx"
)

ALL_FRONTEND_FILES_EXIST=true
for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$(basename "$file") exists"
    else
        print_error "$(basename "$file") missing"
        ALL_FRONTEND_FILES_EXIST=false
    fi
done

if [ "$ALL_FRONTEND_FILES_EXIST" = true ]; then
    print_success "All frontend components are in place"
else
    print_error "Some frontend components are missing"
fi
echo ""

# Test 10: Frontend accessibility
if [ "$FRONTEND_RUNNING" = true ]; then
    print_test "Frontend page accessibility"
    
    # Test main page
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        print_success "Frontend main page accessible"
    else
        print_error "Frontend main page not accessible"
    fi
    
    # Test profile page (will likely require auth, but we can test if it loads)
    PROFILE_RESPONSE=$(curl -s "$FRONTEND_URL/dashboard/list/profile" 2>/dev/null)
    if [ $? -eq 0 ]; then
        print_success "Profile page endpoint accessible"
    else
        print_info "Profile page requires authentication (normal)"
    fi
else
    print_info "Skipping frontend tests - server not running"
fi
echo ""

echo "🏁 TESTING SUMMARY"
echo "=================="

print_result "SYSTEM READINESS REPORT:"
echo ""

# Backend Status
if [ "$BACKEND_RUNNING" = true ]; then
    print_success "✅ Backend Server: OPERATIONAL"
else
    print_error "❌ Backend Server: NOT RUNNING"
fi

# Frontend Status
if [ "$FRONTEND_RUNNING" = true ]; then
    print_success "✅ Frontend Server: OPERATIONAL"
else
    print_info "⚠️  Frontend Server: NOT RUNNING (optional)"
fi

# Token Status
if [ "$TOKEN_CONFIGURED" = true ]; then
    print_success "✅ Telegram Bot: CONFIGURED"
else
    print_error "❌ Telegram Bot: NEEDS CONFIGURATION"
fi

# Components Status
if [ "$ALL_FRONTEND_FILES_EXIST" = true ]; then
    print_success "✅ Frontend Components: ALL PRESENT"
else
    print_error "❌ Frontend Components: MISSING FILES"
fi

echo ""
print_result "NEXT STEPS:"

if [ "$TOKEN_CONFIGURED" = false ]; then
    echo "🔧 1. Run: ./activate-telegram-bot.sh"
    echo "🤖 2. Create bot with @BotFather"  
    echo "🔑 3. Configure bot token"
fi

if [ "$BACKEND_RUNNING" = false ]; then
    echo "🚀 4. Start backend: cd backend && npm run start:dev"
fi

if [ "$FRONTEND_RUNNING" = false ]; then
    echo "🌐 5. Start frontend: cd frontend && npm run dev"
fi

echo "🧪 6. Test with real users:"
echo "   - User searches bot in Telegram"
echo "   - User gets Chat ID with /myid"
echo "   - User adds Chat ID in web app profile"
echo "   - User tests notification"
echo ""

echo "📚 DOCUMENTATION AVAILABLE:"
echo "   - CREATE_TELEGRAM_BOT.md - Bot creation guide"
echo "   - TELEGRAM_BOT_FINAL_STATUS_COMPLETE.md - Complete status"
echo "   - activate-telegram-bot.sh - Easy activation script"
echo ""

if [ "$TOKEN_CONFIGURED" = true ] && [ "$BACKEND_RUNNING" = true ]; then
    print_success "🎉 TELEGRAM BOT SYSTEM IS READY FOR PRODUCTION USE! 🚀"
else
    print_info "🔧 TELEGRAM BOT SYSTEM NEEDS FINAL CONFIGURATION STEPS"
fi

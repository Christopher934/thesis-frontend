#!/bin/bash

# 🚀 QUICK START - TELEGRAM BOT ACTIVATION
# RSUD Anugerah - Production Ready Deployment

echo "🚀 QUICK START: TELEGRAM BOT ACTIVATION"
echo "======================================"
echo "RSUD Anugerah Hospital Management System"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m' 
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}🔹 STEP $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_important() {
    echo -e "${PURPLE}🎯 $1${NC}"
}

echo "This script will activate your Telegram bot in 3 steps:"
echo "1. Configure bot token"
echo "2. Start backend server"  
echo "3. Verify system"
echo ""

read -p "Press Enter to continue..."
echo ""

# Step 1: Token Configuration
print_step "1: CONFIGURE BOT TOKEN"
echo "========================================="
print_info "You need to create a bot with @BotFather first"
print_info "Instructions: See CREATE_TELEGRAM_BOT.md"
echo ""

read -s -p "🔑 Enter your bot token: " BOT_TOKEN
echo ""

if [[ -z "$BOT_TOKEN" ]]; then
    echo "❌ Token cannot be empty!"
    exit 1
fi

# Update .env
if grep -q "TELEGRAM_BOT_TOKEN=" backend/.env; then
    sed -i '' "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=\"$BOT_TOKEN\"/" backend/.env
    print_success "Bot token configured in .env"
else
    echo "TELEGRAM_BOT_TOKEN=\"$BOT_TOKEN\"" >> backend/.env
    print_success "Bot token added to .env"
fi

# Test bot connection
print_info "Testing bot connection..."
RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
if echo "$RESPONSE" | grep -q '"ok":true'; then
    BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    print_success "Bot connection successful: @$BOT_USERNAME"
else
    echo "❌ Bot connection failed. Check your token."
    exit 1
fi
echo ""

# Step 2: Start Backend
print_step "2: START BACKEND SERVER"
echo "========================================="
print_info "Starting backend server on port 3001..."

cd backend
npm run start:dev &
BACKEND_PID=$!
sleep 10

# Check if backend started
if curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; then
    print_success "Backend server started successfully"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..
echo ""

# Step 3: Verify System
print_step "3: VERIFY SYSTEM"
echo "========================================="
print_info "Running system verification..."

./test-telegram-bot-complete.sh | tail -n 20

echo ""
print_important "SYSTEM ACTIVATION COMPLETE! 🎉"
echo ""

echo "📋 NEXT STEPS FOR USERS:"
echo "========================"
echo "1. Search for your bot: @$BOT_USERNAME"
echo "2. Send /start to the bot"
echo "3. Send /myid to get Chat ID"
echo "4. Open web app → Profile → Telegram Settings"
echo "5. Enter Chat ID and test notification"
echo ""

echo "🔗 USEFUL LINKS:"
echo "==============="
echo "• Web App: http://localhost:3000"
echo "• Backend API: http://localhost:3001"
echo "• Bot: @$BOT_USERNAME"
echo ""

echo "📚 DOCUMENTATION:"
echo "=================="
echo "• Complete Guide: TELEGRAM_BOT_IMPLEMENTATION_FINAL_COMPLETE.md"
echo "• User Manual: CREATE_TELEGRAM_BOT.md"
echo "• Testing: test-telegram-bot-complete.sh"
echo ""

print_success "Telegram Bot System is LIVE and ready for users! 🚀"

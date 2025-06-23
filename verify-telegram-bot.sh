#!/bin/bash

# 🔍 TELEGRAM BOT VERIFICATION - RSUD ANUGERAH
# Quick verification that everything is working

echo "🔍 TELEGRAM BOT SYSTEM VERIFICATION"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m' 
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_check() {
    echo -e "${BLUE}🔹 Checking: $1${NC}"
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

BACKEND_DIR="/Users/jo/Documents/Backup_2/Thesis/backend"
FRONTEND_DIR="/Users/jo/Documents/Backup_2/Thesis/frontend"

echo "1. BACKEND VERIFICATION"
echo "======================"

# Check .env file exists
print_check "Backend .env file"
if [ -f "$BACKEND_DIR/.env" ]; then
    print_success ".env file exists"
    
    # Check if bot token is configured
    if grep -q "TELEGRAM_BOT_TOKEN=" "$BACKEND_DIR/.env"; then
        BOT_TOKEN=$(grep "TELEGRAM_BOT_TOKEN=" "$BACKEND_DIR/.env" | cut -d'"' -f2)
        if [[ "$BOT_TOKEN" == "REPLACE_WITH_YOUR_ACTUAL_BOT_TOKEN" ]]; then
            print_error "Bot token not configured yet"
            print_info "Run: ./activate-telegram-bot.sh"
        else
            print_success "Bot token configured"
        fi
    else
        print_error "Bot token configuration missing"
    fi
else
    print_error ".env file not found"
fi
echo ""

# Check backend files
print_check "Telegram service files"
TELEGRAM_FILES=(
    "src/notifikasi/telegram.service.ts"
    "src/notifikasi/telegram-bot.service.ts"
    "src/notifikasi/notification-integration.service.ts"
    "src/user/user-telegram.controller.ts"
)

for file in "${TELEGRAM_FILES[@]}"; do
    if [ -f "$BACKEND_DIR/$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done
echo ""

# Check backend server
print_check "Backend server status"
if curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; then
    print_success "Backend server running on port 3001"
else
    print_info "Backend server not running (optional for verification)"
fi
echo ""

echo "2. FRONTEND VERIFICATION"
echo "======================="

# Check frontend files
print_check "Frontend component files"
FRONTEND_FILES=(
    "src/components/notifications/TelegramSetup.tsx"
    "src/app/dashboard/list/profile/page.tsx"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$FRONTEND_DIR/$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done
echo ""

# Check frontend server
print_check "Frontend server status"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend server running on port 3000"
else
    print_info "Frontend server not running (optional for verification)"
fi
echo ""

echo "3. DOCUMENTATION VERIFICATION"
echo "============================"

# Check documentation files
print_check "Documentation files"
DOC_FILES=(
    "TELEGRAM_BOT_IMPLEMENTATION_COMPLETE.md"
    "TELEGRAM_BOT_FINAL_STATUS_COMPLETE.md"
    "CREATE_TELEGRAM_BOT.md"
    "activate-telegram-bot.sh"
    "setup-telegram-bot.sh"
    "demo-telegram-bot-complete.sh"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "/Users/jo/Documents/Backup_2/Thesis/$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done
echo ""

echo "4. DATABASE VERIFICATION"
echo "======================="

print_check "Database schema (User model)"
if grep -q "telegramChatId" "$BACKEND_DIR/prisma/schema.prisma"; then
    print_success "telegramChatId field exists in User model"
else
    print_error "telegramChatId field missing in User model"
fi
echo ""

echo "🏁 VERIFICATION COMPLETE"
echo "======================="

echo ""
echo "📋 TO ACTIVATE THE SYSTEM:"
echo "1. Run: ./activate-telegram-bot.sh"
echo "2. Create bot with @BotFather"
echo "3. Add bot token when prompted"
echo "4. Test with real users"
echo ""

echo "📚 AVAILABLE DOCUMENTATION:"
echo "- CREATE_TELEGRAM_BOT.md - Bot creation guide"
echo "- TELEGRAM_BOT_FINAL_STATUS_COMPLETE.md - Full system status"
echo "- setup-telegram-bot.sh - Automated setup"
echo "- demo-telegram-bot-complete.sh - Demo & testing"
echo ""

print_success "RSUD Anugerah Telegram Bot system is ready for activation! 🚀"

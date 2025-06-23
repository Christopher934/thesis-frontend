#!/bin/bash

# Demo script untuk setup dan testing Telegram Bot
# RSUD Anugerah Hospital Management System

echo "🤖 RSUD Anugerah Telegram Bot Setup Demo"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:3001"

echo -e "${BLUE}📋 Telegram Bot Setup Checklist:${NC}"
echo ""
echo "✅ Backend service ready"
echo "✅ TelegramService implemented"
echo "✅ TelegramBotService implemented"
echo "✅ Webhook endpoints ready"
echo "✅ Profile page with Chat ID field ready"
echo ""

echo -e "${YELLOW}⚠️  What you need to do manually:${NC}"
echo ""
echo "1. 🤖 Create Telegram Bot:"
echo "   - Open Telegram, search @BotFather"
echo "   - Send /newbot"
echo "   - Name: RSUD Anugerah Notification Bot"
echo "   - Username: rsud_anugerah_bot (or similar)"
echo "   - Copy the bot token"
echo ""

echo "2. 🔧 Configure Backend:"
echo "   - Add to backend/.env:"
echo "     TELEGRAM_BOT_TOKEN=\"your_bot_token_here\""
echo "   - Restart backend server"
echo ""

echo "3. 🚀 Setup Bot Commands:"
read -p "Press Enter to setup bot commands (make sure backend is running)..."

echo ""
echo -e "${BLUE}🛠️  Setting up bot commands...${NC}"

response=$(curl -s -X POST "$BASE_URL/telegram/setup-commands")
echo "Response: $response"

echo ""
echo "4. 🔍 Test Bot Info:"
response=$(curl -s "$BASE_URL/telegram/bot-info")
echo "Bot Info: $response"

echo ""
echo -e "${BLUE}📱 User Instructions:${NC}"
echo ""
echo "For users to receive Telegram notifications:"
echo ""
echo "1. 💬 User opens Telegram"
echo "2. 🔍 Search for your bot: @rsud_anugerah_bot"
echo "3. 📨 Send /start to the bot"
echo "4. 🆔 Send /myid to get Chat ID"
echo "5. 💾 Copy Chat ID"
echo "6. 🌐 Login to RSUD system"
echo "7. 👤 Go to Profile page"
echo "8. 📋 Paste Chat ID in 'Telegram Chat ID' field"
echo "9. 💾 Save profile"
echo "10. 🔔 Start receiving notifications!"

echo ""
echo -e "${BLUE}🧪 Testing Scenarios:${NC}"
echo ""
echo "Test 1: Shift Reminder"
echo "curl -X POST $BASE_URL/notifikasi/test/shift-reminder \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"userId\": 1}'"
echo ""

echo "Test 2: New Shift Notification"
echo "curl -X POST $BASE_URL/notifikasi/test/new-shift \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"userId\": 1}'"
echo ""

echo -e "${BLUE}📊 CRON Jobs Schedule:${NC}"
echo ""
echo "⏰ Shift Reminders: Every 15 minutes"
echo "🕐 Late Attendance Check: 8:00 AM daily"
echo "🌅 Daily Summary: 6:00 AM daily"
echo ""

echo -e "${BLUE}🔧 Production Deployment:${NC}"
echo ""
echo "For production, setup webhook:"
echo "curl -X POST $BASE_URL/telegram/set-webhook \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"url\": \"https://yourdomain.com/telegram/webhook\"}'"
echo ""

echo -e "${GREEN}✅ Telegram Bot Setup Guide Complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Next: Test the complete system by creating notifications${NC}"
echo "and checking if they arrive both in web and Telegram!"

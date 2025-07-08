#!/bin/bash

# RSUD Anugerah Telegram Bot Setup & Testing Script
# This script helps setup and test the Telegram bot integration

set -e

echo "🤖 RSUD Anugerah Telegram Bot Setup & Testing"
echo "============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if backend directory exists
BACKEND_DIR="/Users/jo/Documents/Backup_2/Thesis/backend"
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found in backend directory"
    print_info "Creating .env file template..."
    cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:root@localhost:5432/rsud_anugerah_db"
JWT_SECRET=anugerahsupersecret
# Add your Telegram bot token below:
# TELEGRAM_BOT_TOKEN="your_bot_token_here"
EOF
    print_warning "Please add your Telegram bot token to .env file"
    exit 1
fi

# Load environment variables
source .env

# Function to setup bot token
setup_bot_token() {
    echo ""
    echo "🔧 TELEGRAM BOT TOKEN SETUP"
    echo "=============================="
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        print_warning "Telegram bot token not configured"
        echo ""
        echo "To get a bot token:"
        echo "1. Open Telegram and search for @BotFather"
        echo "2. Send /newbot command"
        echo "3. Follow the instructions to create your bot"
        echo "4. Copy the token and add it to your .env file"
        echo ""
        echo "Example:"
        echo 'TELEGRAM_BOT_TOKEN="123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"'
        echo ""
        
        read -p "Do you have a bot token to add now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter your bot token: " bot_token
            
            # Add token to .env file
            if grep -q "TELEGRAM_BOT_TOKEN" .env; then
                # Update existing line
                sed -i '' "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=\"$bot_token\"/" .env
            else
                # Add new line
                echo "TELEGRAM_BOT_TOKEN=\"$bot_token\"" >> .env
            fi
            
            print_status "Bot token added to .env file"
            
            # Reload environment
            source .env
        else
            print_info "Please add your bot token to .env file and run this script again"
            return 1
        fi
    else
        print_status "Bot token found in environment"
    fi
}

# Function to test bot connection
test_bot_connection() {
    echo ""
    echo "📡 TESTING BOT CONNECTION"
    echo "========================"
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        print_error "Bot token not configured"
        return 1
    fi
    
    print_info "Testing bot connection..."
    
    # Test bot info
    response=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe")
    
    if echo "$response" | grep -q '"ok":true'; then
        print_status "Bot connection successful!"
        
        # Extract bot info
        bot_name=$(echo "$response" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
        bot_username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        
        echo "   Bot Name: $bot_name"
        echo "   Username: @$bot_username"
        
        return 0
    else
        print_error "Bot connection failed"
        echo "Response: $response"
        return 1
    fi
}

# Function to setup bot commands
setup_bot_commands() {
    echo ""
    echo "🔨 SETTING UP BOT COMMANDS"
    echo "========================="
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        print_error "Bot token not configured"
        return 1
    fi
    
    print_info "Setting up bot commands..."
    
    # Commands configuration
    commands_json='{
        "commands": [
            {"command": "start", "description": "Mulai menggunakan bot RSUD Anugerah"},
            {"command": "help", "description": "Bantuan penggunaan bot"},
            {"command": "myid", "description": "Dapatkan Chat ID Telegram Anda"},
            {"command": "notifications", "description": "Status notifikasi"}
        ]
    }'
    
    response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setMyCommands" \
        -H "Content-Type: application/json" \
        -d "$commands_json")
    
    if echo "$response" | grep -q '"ok":true'; then
        print_status "Bot commands setup successful!"
        echo "Available commands:"
        echo "   /start - Mulai menggunakan bot"
        echo "   /help - Bantuan penggunaan"
        echo "   /myid - Dapatkan Chat ID"
        echo "   /notifications - Status notifikasi"
    else
        print_error "Failed to setup bot commands"
        echo "Response: $response"
    fi
}

# Function to test send message
test_send_message() {
    echo ""
    echo "💬 TESTING MESSAGE SENDING"
    echo "========================="
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        print_error "Bot token not configured"
        return 1
    fi
    
    read -p "Enter a Chat ID to test message sending (or press Enter to skip): " chat_id
    
    if [ -z "$chat_id" ]; then
        print_info "Skipping message test"
        print_info "To get your Chat ID:"
        print_info "1. Search for your bot in Telegram: @your_bot_username"
        print_info "2. Send /start to the bot"
        print_info "3. Send /myid to get your Chat ID"
        return 0
    fi
    
    test_message="🏥 Halo! Bot RSUD Anugerah sudah siap dan terhubung! ✅

🔔 Anda akan menerima notifikasi untuk:
• Reminder shift
• Konfirmasi tukar shift  
• Persetujuan cuti
• Peringatan keterlambatan
• Informasi sistem

📱 Ketik /help untuk bantuan lebih lanjut."
    
    print_info "Sending test message to Chat ID: $chat_id"
    
    response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -H "Content-Type: application/json" \
        -d "{
            \"chat_id\": \"$chat_id\",
            \"text\": \"$test_message\",
            \"parse_mode\": \"HTML\"
        }")
    
    if echo "$response" | grep -q '"ok":true'; then
        print_status "Test message sent successfully!"
    else
        print_error "Failed to send test message"
        echo "Response: $response"
    fi
}

# Function to check backend server
check_backend_server() {
    echo ""
    echo "🖥️  CHECKING BACKEND SERVER"
    echo "=========================="
    
    if curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; then
        print_status "Backend server is running on port 3001"
    else
        print_warning "Backend server not responding on port 3001"
        
        read -p "Do you want to start the backend server? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Starting backend server..."
            
            # Kill existing server processes
            pkill -f "npm.*start" 2>/dev/null || true
            sleep 2
            
            # Start server in background
            npm run start:dev > server.log 2>&1 &
            
            print_info "Waiting for server to start..."
            sleep 8
            
            if curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; then
                print_status "Backend server started successfully"
            else
                print_error "Failed to start backend server"
                print_info "Check server.log for details"
            fi
        fi
    fi
}

# Function to test notification integration
test_notification_integration() {
    echo ""
    echo "🔔 TESTING NOTIFICATION INTEGRATION"
    echo "=================================="
    
    # Check if backend is running
    if ! curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; then
        print_error "Backend server not running"
        return 1
    fi
    
    print_info "Testing notification API integration..."
    
    # Login to get token
    print_info "Logging in..."
    login_response=$(curl -s -X POST "http://localhost:3001/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@example.com",
            "password": "admin123"
        }')
    
    if echo "$login_response" | grep -q "access_token"; then
        token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        print_status "Login successful"
        
        # Test creating notification
        print_info "Creating test notification..."
        notif_response=$(curl -s -X POST "http://localhost:3001/notifikasi" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d '{
                "judul": "🤖 Test Telegram Bot Integration",
                "pesan": "Bot Telegram RSUD Anugerah berhasil terhubung dan siap mengirim notifikasi!",
                "jenis": "SISTEM_INFO"
            }')
        
        if echo "$notif_response" | grep -q '"id"'; then
            print_status "Notification created successfully"
            print_info "The notification has been created in the system"
            print_info "If user has Telegram Chat ID configured, they will receive this notification"
        else
            print_error "Failed to create notification"
            echo "Response: $notif_response"
        fi
    else
        print_error "Login failed"
        echo "Response: $login_response"
    fi
}

# Main execution
main() {
    echo "Starting Telegram bot setup process..."
    echo ""
    
    # Step 1: Setup bot token
    if ! setup_bot_token; then
        exit 1
    fi
    
    # Step 2: Test bot connection
    if ! test_bot_connection; then
        print_error "Cannot proceed without valid bot connection"
        exit 1
    fi
    
    # Step 3: Setup bot commands
    setup_bot_commands
    
    # Step 4: Check backend server
    check_backend_server
    
    # Step 5: Test message sending
    test_send_message
    
    # Step 6: Test notification integration
    test_notification_integration
    
    echo ""
    echo "🎉 TELEGRAM BOT SETUP COMPLETED!"
    echo "==============================="
    echo ""
    print_status "Bot is configured and ready to use"
    echo ""
    echo "Next steps:"
    echo "1. Share your bot with users: @your_bot_username"
    echo "2. Users should send /start to your bot"
    echo "3. Users should send /myid to get their Chat ID"
    echo "4. Users should add their Chat ID to their profile in the web app"
    echo "5. Test sending notifications from the web app"
    echo ""
    print_info "Bot setup documentation: TELEGRAM_BOT_SETUP_COMPLETE.md"
}

# Run main function
main "$@"

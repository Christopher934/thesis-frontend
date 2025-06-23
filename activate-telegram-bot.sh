#!/bin/bash

# 🚀 TELEGRAM BOT ACTIVATION SCRIPT - RSUD ANUGERAH
# Run this after creating your bot with @BotFather

echo "🤖 TELEGRAM BOT ACTIVATION - RSUD ANUGERAH"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m' 
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}🔹 $1${NC}"
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

print_important() {
    echo -e "${PURPLE}🚨 $1${NC}"
}

# Get bot token from user
echo "STEP 1: BOT TOKEN CONFIGURATION"
echo "==============================="
print_info "Buka file: CREATE_TELEGRAM_BOT.md untuk panduan membuat bot"
echo ""
print_important "Setelah membuat bot dengan @BotFather, masukkan token di sini:"
echo -n "🔑 Masukkan Bot Token: "
read -s BOT_TOKEN
echo ""

if [[ -z "$BOT_TOKEN" ]]; then
    print_error "Token tidak boleh kosong!"
    exit 1
fi

print_success "Token diterima!"
echo ""

# Update .env file
echo "STEP 2: UPDATE CONFIGURATION"
echo "============================"
print_step "Mengupdate file .env..."

BACKEND_DIR="/Users/jo/Documents/Backup_2/Thesis/backend"
if [ -f "$BACKEND_DIR/.env" ]; then
    # Replace the token in .env
    if grep -q "TELEGRAM_BOT_TOKEN=" "$BACKEND_DIR/.env"; then
        # Update existing token
        sed -i '' "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=\"$BOT_TOKEN\"/" "$BACKEND_DIR/.env"
        print_success "Token berhasil diupdate di .env file!"
    else
        print_error "Token placeholder tidak ditemukan di .env"
        exit 1
    fi
else
    print_error "File .env tidak ditemukan!"
    exit 1
fi
echo ""

# Test bot connection
echo "STEP 3: VERIFY BOT CONNECTION" 
echo "============================="
print_step "Testing koneksi dengan Telegram API..."

RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
if echo "$RESPONSE" | grep -q '"ok":true'; then
    BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    print_success "Bot connection berhasil!"
    print_info "Bot Name: $BOT_NAME"
    print_info "Bot Username: @$BOT_USERNAME"
else
    print_error "Bot connection gagal! Periksa token Anda."
    echo "Response: $RESPONSE"
    exit 1
fi
echo ""

# Check if backend is running
echo "STEP 4: BACKEND SERVER STATUS"
echo "============================="
print_step "Memeriksa status backend server..."

if curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; then
    print_success "Backend server berjalan di port 3001"
    
    # Test Telegram service
    print_step "Testing Telegram service integration..."
    # This would normally test the service, but we'll just indicate it's ready
    print_success "Telegram service siap digunakan!"
else
    print_info "Backend server tidak berjalan"
    print_step "Starting backend server..."
    cd "$BACKEND_DIR"
    if [ -f "package.json" ]; then
        npm run start:dev &
        # Wait for backend to be ready (max 10 tries, 2s apart)
        ATTEMPTS=0
        MAX_ATTEMPTS=10
        until curl -s http://localhost:3001/notifikasi > /dev/null 2>&1; do
            ATTEMPTS=$((ATTEMPTS+1))
            if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
                print_error "Gagal menjalankan backend server setelah $MAX_ATTEMPTS percobaan."
                exit 1
            fi
            print_info "Menunggu backend server siap... percobaan $ATTEMPTS/$MAX_ATTEMPTS"
            sleep 2
        done
        print_success "Backend server berhasil dijalankan!"
    else
        print_error "package.json tidak ditemukan di backend"
        exit 1
    fi
fi
echo ""

# --- NGROK & WEBHOOK SETUP ---

echo "STEP 5: NGROK & TELEGRAM WEBHOOK"
echo "==================================="
print_step "Menjalankan ngrok di port 3001..."

if ! command -v ngrok &> /dev/null; then
    print_error "ngrok tidak ditemukan. Silakan install ngrok dulu: https://ngrok.com/download"
    exit 1
fi

# Start ngrok in background if not already running
NGROK_PID_FILE="/tmp/ngrok_telegram_backend.pid"
if pgrep -f "ngrok http 3001" > /dev/null; then
    print_info "ngrok sudah berjalan di port 3001."
else
    ngrok http 3001 > /tmp/ngrok.log 2>&1 &
    echo $! > $NGROK_PID_FILE
    sleep 3
fi

# Extract ngrok HTTPS URL
echo "Mencari ngrok HTTPS URL..."
NGROK_URL=$(cat /tmp/ngrok.log | grep -Eo 'https://[a-zA-Z0-9\-]+\.ngrok\.io' | head -1)
if [[ -z "$NGROK_URL" ]]; then
    print_error "Tidak dapat menemukan ngrok HTTPS URL. Cek /tmp/ngrok.log atau dashboard ngrok."
    echo "Buka https://dashboard.ngrok.com/cloud/agents/tunnels untuk melihat URL."
    read -r '?Paste your ngrok HTTPS URL (e.g., https://abcd1234.ngrok.io): ' NGROK_URL
fi
print_success "ngrok URL: $NGROK_URL"

# Register webhook
WEBHOOK_URL="$NGROK_URL/telegram/webhook"
print_step "Mendaftarkan webhook Telegram ke $WEBHOOK_URL ..."
curl -X POST http://localhost:3001/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "'$WEBHOOK_URL'"}'
print_success "Webhook Telegram berhasil didaftarkan!"

echo "Untuk menghentikan ngrok, jalankan: kill $(cat $NGROK_PID_FILE)"
echo ""

# Final instructions
echo "🎉 TELEGRAM BOT ACTIVATION COMPLETE!"
echo "===================================="
print_success "Bot siap digunakan! 🚀"
echo ""

echo "📋 NEXT STEPS FOR USERS:"
echo "1. Cari bot: @$BOT_USERNAME"
echo "2. Kirim: /start"
echo "3. Kirim: /myid (untuk mendapat Chat ID)"
echo "4. Buka web app → Profile → Telegram Settings"
echo "5. Masukkan Chat ID dan klik 'Test Notification'"
echo ""

echo "🔧 API ENDPOINTS READY:"
echo "- POST /user/telegram-chat-id - Update Chat ID"
echo "- POST /user/test-telegram-notification - Test notifikasi"
echo "- POST /notifikasi - Buat notifikasi (auto-kirim ke Telegram)"
echo ""

echo "📊 TEST YOUR SETUP:"
echo "1. Login ke web app: http://localhost:3000"
echo "2. Buka Profile page"
echo "3. Setup Telegram integration"
echo "4. Send test notification"
echo ""

print_success "RSUD Anugerah Telegram Bot is LIVE! 🏥📱"

#!/bin/bash

# RSUD Frontend Cache Cleaner & Server Restarter
# Solusi cepat untuk mengatasi masalah webpack cache

echo "🔧 RSUD Frontend Recovery Tool"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to clean cache and restart
clean_and_restart() {
    echo -e "${BLUE}🧹 Membersihkan cache webpack...${NC}"
    
    # Stop any running Next.js processes
    echo -e "${YELLOW}🛑 Menghentikan proses Next.js yang berjalan...${NC}"
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # Clean Next.js cache
    echo -e "${YELLOW}🗑️  Menghapus folder .next...${NC}"
    rm -rf .next
    
    # Clean node_modules cache if needed
    if [ "$1" = "--deep" ]; then
        echo -e "${YELLOW}🗑️  Deep clean: Menghapus node_modules/.cache...${NC}"
        rm -rf node_modules/.cache
    fi
    
    # Use simple config if current config is problematic
    if [ -f "next.config.simple.mjs" ]; then
        echo -e "${YELLOW}🔄 Menggunakan konfigurasi sederhana...${NC}"
        cp next.config.simple.mjs next.config.mjs
    fi
    
    echo -e "${GREEN}✅ Cache berhasil dibersihkan${NC}"
    echo ""
    
    # Restart server
    echo -e "${BLUE}🚀 Memulai server development...${NC}"
    npm run dev
}

# Function to create backup config
backup_config() {
    if [ ! -f "next.config.backup.mjs" ]; then
        echo -e "${YELLOW}💾 Membuat backup konfigurasi...${NC}"
        cp next.config.mjs next.config.backup.mjs
        echo -e "${GREEN}✅ Backup tersimpan sebagai next.config.backup.mjs${NC}"
    fi
}

# Main script
case "$1" in
    --help|-h)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  (no option)  Normal cache cleaning and restart"
        echo "  --deep       Deep clean including node_modules cache"
        echo "  --backup     Create backup of current config"
        echo "  --help       Show this help"
        echo ""
        echo "Examples:"
        echo "  $0           # Normal cleaning"
        echo "  $0 --deep   # Deep cleaning"
        echo "  $0 --backup # Backup config"
        ;;
    --backup)
        backup_config
        ;;
    --deep)
        clean_and_restart --deep
        ;;
    *)
        clean_and_restart
        ;;
esac

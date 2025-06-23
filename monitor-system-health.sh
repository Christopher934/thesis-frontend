#!/bin/bash

# RSUD Shift Management System - Health Monitor
# Ultra-stable monitoring script to prevent vendor chunks 404 errors

echo "🏥 RSUD Shift Management System - Health Monitor"
echo "================================================"
echo "$(date): Starting system health check..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "🔍 Checking $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ HEALTHY (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY (HTTP $response)${NC}"
        return 1
    fi
}

# Function to check for vendor chunks errors
check_vendor_chunks() {
    echo -n "🧩 Checking for vendor chunks issues... "
    
    # Check if .next directory exists and has proper structure
    if [ -d "/Users/jo/Documents/Backup 2/Thesis/frontend/.next" ]; then
        chunk_files=$(find "/Users/jo/Documents/Backup 2/Thesis/frontend/.next" -name "*chunks*" 2>/dev/null | wc -l)
        if [ $chunk_files -gt 0 ]; then
            echo -e "${YELLOW}⚠️  WARNING: Found $chunk_files chunk files (potential issue)${NC}"
            return 1
        else
            echo -e "${GREEN}✅ NO CHUNK FILES (ULTRA-STABLE CONFIG ACTIVE)${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  WARNING: .next directory not found${NC}"
        return 1
    fi
}

# Function to check Next.js configuration
check_nextjs_config() {
    echo -n "⚙️  Checking Next.js configuration... "
    
    config_file="/Users/jo/Documents/Backup 2/Thesis/frontend/next.config.mjs"
    
    if grep -q "splitChunks: false" "$config_file" 2>/dev/null; then
        echo -e "${GREEN}✅ ULTRA-STABLE CONFIG ACTIVE${NC}"
        return 0
    else
        echo -e "${RED}❌ STANDARD CONFIG (RISKY)${NC}"
        return 1
    fi
}

# Function to auto-fix vendor chunks issues
auto_fix_vendor_chunks() {
    echo "🔧 Auto-fixing vendor chunks issues..."
    
    cd "/Users/jo/Documents/Backup 2/Thesis/frontend"
    
    # Kill existing processes
    echo "   • Stopping existing processes..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # Clean cache
    echo "   • Cleaning cache directories..."
    rm -rf .next node_modules/.cache out 2>/dev/null || true
    
    # Restart with ultra-stable config
    echo "   • Restarting with ultra-stable configuration..."
    npm run dev > /dev/null 2>&1 &
    
    # Wait for startup
    sleep 5
    
    echo -e "${GREEN}✅ Auto-fix completed${NC}"
}

# Main health check routine
main() {
    echo ""
    echo "📊 SYSTEM HEALTH CHECK"
    echo "======================"
    
    # Check frontend
    frontend_healthy=false
    if check_service "Frontend (Next.js)" "http://localhost:3000"; then
        frontend_healthy=true
    fi
    
    # Check backend
    backend_healthy=false
    if check_service "Backend (NestJS)" "http://localhost:3001"; then
        backend_healthy=true
    fi
    
    # Check vendor chunks
    chunks_healthy=false
    if check_vendor_chunks; then
        chunks_healthy=true
    fi
    
    # Check configuration
    config_healthy=false
    if check_nextjs_config; then
        config_healthy=true
    fi
    
    echo ""
    echo "📋 HEALTH SUMMARY"
    echo "================="
    
    # Overall status
    if $frontend_healthy && $backend_healthy && $chunks_healthy && $config_healthy; then
        echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL${NC}"
        echo -e "${GREEN}🛡️  ULTRA-STABLE CONFIGURATION ACTIVE${NC}"
        echo -e "${GREEN}✅ NO VENDOR CHUNKS ISSUES DETECTED${NC}"
        exit 0
    else
        echo -e "${RED}⚠️  SYSTEM ISSUES DETECTED${NC}"
        
        # Auto-fix if vendor chunks issues
        if ! $chunks_healthy; then
            echo ""
            echo "🚨 VENDOR CHUNKS ISSUES DETECTED - INITIATING AUTO-FIX"
            auto_fix_vendor_chunks
            
            # Re-check after fix
            sleep 3
            if check_service "Frontend (After Fix)" "http://localhost:3000"; then
                echo -e "${GREEN}✅ AUTO-FIX SUCCESSFUL${NC}"
                exit 0
            else
                echo -e "${RED}❌ AUTO-FIX FAILED - MANUAL INTERVENTION REQUIRED${NC}"
            fi
        fi
        
        echo ""
        echo "🛠️  RECOMMENDED ACTIONS:"
        if ! $frontend_healthy; then
            echo "   • Frontend not responding - run: cd frontend && npm run dev"
        fi
        if ! $backend_healthy; then
            echo "   • Backend not responding - check backend logs"
        fi
        if ! $config_healthy; then
            echo "   • Apply ultra-stable config - run: ./emergency-recovery.sh"
        fi
        
        exit 1
    fi
}

# Run with continuous monitoring option
if [ "$1" = "--continuous" ] || [ "$1" = "-c" ]; then
    echo "🔄 Starting continuous monitoring (every 30 seconds)..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        main
        echo ""
        echo "💤 Waiting 30 seconds before next check..."
        sleep 30
        echo ""
    done
else
    main
fi

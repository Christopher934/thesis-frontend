#!/bin/bash

# Test Event Notification System
# Tests whether notifications are triggered when creating events

API_BASE_URL="http://localhost:3001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Starting Event Notification Test${NC}"
echo ""
echo "This test will:"
echo "1. Login as admin"
echo "2. Create a test event"  
echo "3. Check if notifications were created"
echo "====================================="
echo ""

# Step 1: Login
echo -e "${BLUE}🔐 Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rsud.com","password":"admin123"}' \
  ${API_BASE_URL}/auth/login)

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Step 2: Create test event
echo ""
echo -e "${BLUE}📅 Creating test event...${NC}"

# Get tomorrow's date
TOMORROW=$(date -j -f "%Y-%m-%d" -v+1d "$(date +%Y-%m-%d)" "+%Y-%m-%dT09:00:00.000Z")
TOMORROW_END=$(date -j -f "%Y-%m-%d" -v+1d "$(date +%Y-%m-%d)" "+%Y-%m-%dT11:00:00.000Z")

EVENT_DATA=$(cat <<EOF
{
  "nama": "Test Event - Rapat Mingguan Auto",
  "jenisKegiatan": "RAPAT",
  "deskripsi": "Test event untuk mengecek sistem notifikasi",
  "tanggalMulai": "$TOMORROW",
  "tanggalSelesai": "$TOMORROW_END",
  "waktuMulai": "09:00",
  "waktuSelesai": "11:00",
  "lokasi": "Ruang Rapat Utama",
  "kapasitas": 20,
  "penanggungJawab": "Test Admin",
  "kontak": "081234567890",
  "departemen": "IT",
  "prioritas": "TINGGI",
  "targetPeserta": ["ADMIN", "SUPERVISOR"],
  "status": "DIRENCANAKAN",
  "catatan": "Event test untuk notification system"
}
EOF
)

EVENT_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EVENT_DATA" \
  ${API_BASE_URL}/events)

if echo "$EVENT_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Event created successfully${NC}"
    EVENT_ID=$(echo "$EVENT_RESPONSE" | grep -o '"id":[0-9]*' | sed 's/"id"://')
    echo "Event ID: $EVENT_ID"
else
    echo -e "${RED}❌ Event creation failed${NC}"
    echo "Response: $EVENT_RESPONSE"
    exit 1
fi

# Step 3: Check notifications (wait a moment first)
echo ""
echo -e "${BLUE}🔔 Checking notifications...${NC}"
echo "Waiting 3 seconds for notifications to be processed..."
sleep 3

NOTIF_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  ${API_BASE_URL}/notifikasi)

if echo "$NOTIF_RESPONSE" | grep -q '"judul"'; then
    echo -e "${GREEN}✅ Notifications retrieved${NC}"
    
    # Count recent notifications (this is a simple check)
    RECENT_COUNT=$(echo "$NOTIF_RESPONSE" | grep -o '"Event Baru Dibuat"' | wc -l | xargs)
    TOTAL_COUNT=$(echo "$NOTIF_RESPONSE" | grep -o '"id":[0-9]*' | wc -l | xargs)
    
    if [ "$RECENT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Found $RECENT_COUNT recent event notification(s)${NC}"
        echo "Total notifications: $TOTAL_COUNT"
        echo ""
        echo "Recent notifications about events:"
        echo "$NOTIF_RESPONSE" | grep -A 2 -B 2 "Event Baru Dibuat" | head -10
    else
        echo -e "${RED}❌ No recent event notifications found${NC}"
        echo "Total notifications: $TOTAL_COUNT"
        if [ "$TOTAL_COUNT" -gt 0 ]; then
            echo "Sample notifications:"
            echo "$NOTIF_RESPONSE" | head -200
        fi
    fi
else
    echo -e "${RED}❌ Failed to retrieve notifications${NC}"
    echo "Response: $NOTIF_RESPONSE"
fi

# Results summary
echo ""
echo -e "${BLUE}📊 Test Results:${NC}"
echo "================"

if [ "$RECENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ SUCCESS: Event notification system is working!${NC}"
    echo "   - Event was created successfully"
    echo "   - Notifications were generated"
    echo "   - Admins will receive notifications for new events"
else
    echo -e "${RED}❌ FAILURE: Event notification system is NOT working${NC}"
    echo "   - Event was created successfully"
    echo "   - But no notifications were generated"
    echo "   - Need to check backend notification integration"
fi

echo ""
echo -e "${YELLOW}🧹 Cleanup:${NC}"
echo "You may want to delete the test event (ID: $EVENT_ID) from the admin panel."

echo ""
echo -e "${BLUE}🔧 Debug Info:${NC}"
echo "API Base URL: $API_BASE_URL"
echo "Event ID: $EVENT_ID"
echo "Token Length: ${#TOKEN}"

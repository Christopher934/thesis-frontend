#!/bin/bash

# Integration test for shift swap system
echo "🔄 Testing Shift Swap Integration..."
echo "====================================="

API_BASE="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Login as pegawaione (user ID 2)
echo -e "\n${YELLOW}Step 1: Login as pegawaione${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pegawai1@example.com", 
    "password": "pegawai123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful! User ID: $USER_ID${NC}"
else
    echo -e "${RED}❌ Login failed!${NC}"
    exit 1
fi

# Step 2: Get available shifts
echo -e "\n${YELLOW}Step 2: Get available shifts${NC}"
SHIFTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/shifts")
echo "Available shifts:"
echo $SHIFTS_RESPONSE | head -c 200
echo ""

# Step 3: Create a shift swap request
echo -e "\n${YELLOW}Step 3: Create shift swap request${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/shift-swap-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "toUserId": 3,
    "shiftId": 1,
    "alasan": "Kebutuhan mendesak - acara keluarga"
  }')

if echo $CREATE_RESPONSE | grep -q '"id"'; then
    echo -e "${GREEN}✅ Shift swap request created successfully!${NC}"
    REQUEST_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "Request ID: $REQUEST_ID"
else
    echo -e "${RED}❌ Failed to create shift swap request${NC}"
    echo "Response: $CREATE_RESPONSE"
fi

# Step 4: Get all shift swap requests
echo -e "\n${YELLOW}Step 4: Get all shift swap requests${NC}"
ALL_REQUESTS=$(curl -s "$API_BASE/shift-swap-requests")
echo "All requests:"
echo $ALL_REQUESTS | head -c 300
echo ""

# Step 5: Get my requests
echo -e "\n${YELLOW}Step 5: Get my requests${NC}"
MY_REQUESTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/shift-swap-requests/my-requests?userId=$USER_ID")
echo "My requests:"
echo $MY_REQUESTS | head -c 300
echo ""

# Step 6: Login as target user (pegawaitwo - user ID 3) and respond
echo -e "\n${YELLOW}Step 6: Login as target user (pegawaitwo)${NC}"
TARGET_LOGIN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pegawai2@example.com",
    "password": "pegawai456"
  }')

TARGET_TOKEN=$(echo $TARGET_LOGIN | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TARGET_TOKEN" ] && [ -n "$REQUEST_ID" ]; then
    echo -e "${GREEN}✅ Target user login successful!${NC}"
    
    # Respond to the request
    echo -e "\n${YELLOW}Step 7: Target user accepts the request${NC}"
    RESPOND_RESPONSE=$(curl -s -X PATCH "$API_BASE/shift-swap-requests/$REQUEST_ID/respond" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TARGET_TOKEN" \
      -d '{
        "status": "APPROVED_BY_TARGET",
        "userId": 3
      }')
    
    if echo $RESPOND_RESPONSE | grep -q '"status"'; then
        echo -e "${GREEN}✅ Request response successful!${NC}"
        echo "Response: $RESPOND_RESPONSE"
    else
        echo -e "${RED}❌ Failed to respond to request${NC}"
        echo "Response: $RESPOND_RESPONSE"
    fi
else
    echo -e "${RED}❌ Target user login failed or no request ID${NC}"
fi

echo -e "\n${YELLOW}Final Status Check:${NC}"
FINAL_STATUS=$(curl -s "$API_BASE/shift-swap-requests")
echo $FINAL_STATUS | head -c 400

echo -e "\n\n✅ Integration test completed!"
echo "🌐 Frontend URL: http://localhost:3000/list/ajukantukarshift"
echo "📖 Test credentials:"
echo "   - User 1: pegawai1@example.com / pegawai123"
echo "   - User 2: pegawai2@example.com / pegawai456"

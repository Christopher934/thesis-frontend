#!/bin/bash

# Comprehensive test script for Shift Swap Request System
echo "🔄 Testing Shift Swap Request System..."
echo "========================================"

API_BASE="http://localhost:3001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: ${description}${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    fi
    
    # Extract HTTP status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $status_code)${NC}"
        echo "Response: $body" | head -c 200
        if [ ${#body} -gt 200 ]; then
            echo "... (truncated)"
        fi
    else
        echo -e "${RED}❌ FAILED (HTTP $status_code)${NC}"
        echo "Response: $body"
    fi
}

# Test 1: Get all shift swap requests
test_endpoint "GET" "/shift-swap-requests" "" "Get all shift swap requests"

# Test 2: Create a new shift swap request
test_endpoint "POST" "/shift-swap-requests" '{
    "toUserId": 2,
    "shiftId": 1,
    "alasan": "Automated test request",
    "fromUserId": 1
}' "Create new shift swap request"

# Test 3: Get specific user's requests
test_endpoint "GET" "/shift-swap-requests/my-requests?userId=1" "" "Get user's own requests"

# Test 4: Get pending approvals
test_endpoint "GET" "/shift-swap-requests/pending-approvals?userId=2" "" "Get pending approvals for target user"

# Test 5: Get pending approvals for supervisor
test_endpoint "GET" "/shift-swap-requests/pending-approvals?userId=3" "" "Get pending approvals for supervisor"

# Test 6: Test respond to request (this will fail without a valid request ID, but shows the endpoint)
test_endpoint "PATCH" "/shift-swap-requests/1/respond" '{
    "action": "accept",
    "userId": 2
}' "Respond to shift swap request (accept)"

echo -e "\n${YELLOW}========================================"
echo "🏁 Test completed!"
echo -e "========================================${NC}"

# Test frontend accessibility
echo -e "\n${YELLOW}Testing Frontend Accessibility:${NC}"
frontend_response=$(curl -s -w "%{http_code}" http://localhost:3000 -o /dev/null)
if [ "$frontend_response" = "200" ]; then
    echo -e "${GREEN}✅ Frontend accessible at http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend not accessible (HTTP $frontend_response)${NC}"
fi

# Test backend health
echo -e "\n${YELLOW}Testing Backend Health:${NC}"
backend_response=$(curl -s -w "%{http_code}" http://localhost:3001 -o /dev/null)
if [ "$backend_response" = "200" ]; then
    echo -e "${GREEN}✅ Backend accessible at http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend not accessible (HTTP $backend_response)${NC}"
fi

echo -e "\n${YELLOW}Integration Status:${NC}"
echo "🔗 Frontend: http://localhost:3000/list/ajukantukarshift"
echo "🔗 API Test Page: file://$(pwd)/test-shift-swap-api.html"
echo "📚 Documentation: $(pwd)/SHIFT_SWAP_IMPLEMENTATION_COMPLETE.md"

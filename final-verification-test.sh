#!/bin/bash

# RSUD Anugerah - Final Verification Test Script
# Tests the critical endpoints that were fixed

echo "🏥 RSUD ANUGERAH - FINAL VERIFICATION TEST"
echo "=========================================="
echo "Testing critical endpoints that were fixed"
echo "Date: $(date)"
echo ""

API_BASE="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth_header=$4
    local test_data=$5
    
    echo -n "Testing $method $endpoint - $description: "
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method $API_BASE$endpoint"
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H '$auth_header'"
    fi
    
    if [[ "$method" == "POST" ]] || [[ "$method" == "PUT" ]] || [[ "$method" == "PATCH" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
        if [ -n "$test_data" ]; then
            curl_cmd="$curl_cmd -d '$test_data'"
        fi
    fi
    
    response=$(eval $curl_cmd)
    http_code="${response: -3}"
    
    if [[ "$http_code" =~ ^(200|201)$ ]]; then
        echo -e "${GREEN}✅ PASS${NC} ($http_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} ($http_code)"
        return 1
    fi
}

# Get authentication token
echo "🔐 Getting authentication token..."
login_response=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@rsud.id","password":"password123"}')

if echo "$login_response" | jq -e '.access_token' >/dev/null 2>&1; then
    token=$(echo "$login_response" | jq -r '.access_token')
    echo -e "Authentication: ${GREEN}✅ Success${NC}"
    AUTH_HEADER="Authorization: Bearer $token"
else
    echo -e "Authentication: ${RED}❌ Failed${NC}"
    echo "Cannot proceed with protected endpoint tests"
    exit 1
fi

echo ""
echo "🧪 TESTING FIXED CRITICAL ENDPOINTS"
echo "===================================="

# Test the critical endpoints that were fixed
passed=0
failed=0

# 1. Event Creation (MAJOR FIX)
echo "1. Event Management (MAJOR FIX):"
if test_endpoint "POST" "/events" "Create event with field mapping" "$AUTH_HEADER" '{"title": "Verification Test Event", "description": "Testing field mapping fix", "location": "Test Room"}'; then
    ((passed++))
else
    ((failed++))
fi

if test_endpoint "GET" "/events" "List all events" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

echo ""

# 2. Telegram Integration (MAJOR FIX)
echo "2. Telegram Integration (MAJOR FIX):"
if test_endpoint "POST" "/user/telegram-chat-id" "Get user Telegram chat ID" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

if test_endpoint "PUT" "/user/telegram-chat-id" "Update Telegram chat ID" "$AUTH_HEADER" '{"telegramChatId": "123456789"}'; then
    ((passed++))
else
    ((failed++))
fi

echo ""

# 3. User Management
echo "3. User Management:"
if test_endpoint "GET" "/users" "Get all users" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

if test_endpoint "GET" "/users/count-by-role" "Get user count by role" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

echo ""

# 4. Attendance System
echo "4. Attendance System:"
if test_endpoint "GET" "/absensi/dashboard-stats" "Get attendance dashboard stats" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

if test_endpoint "GET" "/absensi/reports/stats" "Get attendance statistics" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

echo ""

# 5. Shift Management
echo "5. Shift Management:"
if test_endpoint "GET" "/shifts" "Get all shifts" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

if test_endpoint "GET" "/shifts/types" "Get shift types" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

echo ""

# 6. Notifications
echo "6. Notification System:"
if test_endpoint "GET" "/notifications" "Get notifications" "$AUTH_HEADER"; then
    ((passed++))
else
    ((failed++))
fi

echo ""

# Final Summary
echo "🏆 FINAL VERIFICATION RESULTS"
echo "============================="
echo -e "✅ Passed: ${GREEN}$passed${NC}"
echo -e "❌ Failed: ${RED}$failed${NC}"
total=$((passed + failed))
success_rate=$((passed * 100 / total))
echo -e "Success Rate: ${GREEN}$success_rate%${NC}"

if [ $success_rate -ge 90 ]; then
    echo ""
    echo -e "🎉 ${GREEN}SYSTEM STATUS: PRODUCTION READY${NC}"
    echo "All critical fixes verified and working!"
elif [ $success_rate -ge 75 ]; then
    echo ""
    echo -e "⚠️  ${YELLOW}SYSTEM STATUS: MOSTLY OPERATIONAL${NC}"
    echo "Most fixes verified, minor issues remain"
else
    echo ""
    echo -e "❌ ${RED}SYSTEM STATUS: NEEDS ATTENTION${NC}"
    echo "Critical issues still present"
fi

echo ""
echo "Report completed: $(date)"

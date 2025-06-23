#!/bin/bash

echo "🚀 RSUD Anugerah - Complete API CRUD Testing"
echo "=============================================="

API_URL="http://localhost:3001"
TEST_RESULTS_FILE="api-test-results.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log results
log_test() {
    local test_name="$1"
    local status="$2"
    local response="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        echo -e "${YELLOW}Response: $response${NC}"
    fi
    
    echo "[$status] $test_name: $response" >> "$TEST_RESULTS_FILE"
}

# Function to make HTTP request and check response
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local headers="$4"
    local test_name="$5"
    local expected_status="$6"
    
    echo -e "\n${BLUE}Testing:${NC} $test_name"
    echo "  ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$API_URL$endpoint" -H "Content-Type: application/json" -H "$headers" -d "$data" 2>/dev/null)
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data" 2>/dev/null)
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$API_URL$endpoint" -H "$headers" 2>/dev/null)
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$API_URL$endpoint" 2>/dev/null)
        fi
    fi
    
    http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_code" = "$expected_status" ]; then
        log_test "$test_name" "PASS" "HTTP $http_code"
    else
        log_test "$test_name" "FAIL" "Expected HTTP $expected_status, got HTTP $http_code - $response_body"
    fi
    
    # Return response for further processing
    echo "$response_body"
}

# Initialize test results file
echo "RSUD Anugerah API Test Results - $(date)" > "$TEST_RESULTS_FILE"
echo "=============================================" >> "$TEST_RESULTS_FILE"

# Check if backend is running
echo -e "\n${YELLOW}🔗 Checking backend connection...${NC}"
if ! curl -s -X GET "$API_URL/" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running on $API_URL${NC}"
    echo "Please start the backend first with: cd backend && npm run start:dev"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"

echo -e "\n=== 🔐 AUTHENTICATION TESTS ==="

# 1. AUTH - Login (Valid)
login_response=$(test_endpoint "POST" "/auth/login" '{"email": "admin@example.com", "password": "admin123"}' "" "Auth - Valid Login" "200")
ADMIN_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin token obtained${NC}"
    AUTH_HEADER="Authorization: Bearer $ADMIN_TOKEN"
else
    echo -e "${RED}❌ Failed to get admin token${NC}"
    exit 1
fi

# 2. AUTH - Login (Invalid)
test_endpoint "POST" "/auth/login" '{"email": "invalid@test.com", "password": "wrong"}' "" "Auth - Invalid Login" "401"

echo -e "\n=== 👥 USER MANAGEMENT TESTS ==="

# 3. USERS - Get All Users
test_endpoint "GET" "/users" "" "" "Users - Get All" "200"

# 4. USERS - Get User Count by Role  
test_endpoint "GET" "/users/count-by-role" "" "" "Users - Count by Role" "200"

# 5. USERS - Get User Count by Gender
test_endpoint "GET" "/users/count-by-gender" "" "" "Users - Count by Gender" "200"

# 6. USERS - Create New User
create_user_response=$(test_endpoint "POST" "/users" '{
    "username": "testuser001",
    "email": "testuser001@hospital.com",
    "password": "test123",
    "namaDepan": "Test",
    "namaBelakang": "User",
    "alamat": "Test Address",
    "noHp": "081234567890",
    "jenisKelamin": "L",
    "tanggalLahir": "1990-01-01",
    "role": "PERAWAT"
}' "" "Users - Create User" "201")

NEW_USER_ID=$(echo "$create_user_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 7. USERS - Get Specific User
if [ -n "$NEW_USER_ID" ]; then
    test_endpoint "GET" "/users/$NEW_USER_ID" "" "" "Users - Get Specific User" "200"
fi

# 8. USERS - Update User
if [ -n "$NEW_USER_ID" ]; then
    test_endpoint "PUT" "/users/$NEW_USER_ID" '{
        "namaDepan": "Updated Test",
        "namaBelakang": "Updated User"
    }' "" "Users - Update User" "200"
fi

echo -e "\n=== 📝 NOTIFICATION TESTS ==="

# 9. NOTIFICATIONS - Get All (with Auth)
test_endpoint "GET" "/notifikasi" "" "$AUTH_HEADER" "Notifications - Get All" "200"

# 10. NOTIFICATIONS - Get Unread Count
test_endpoint "GET" "/notifikasi/unread-count" "" "$AUTH_HEADER" "Notifications - Unread Count" "200"

# 11. NOTIFICATIONS - Create Notification
create_notif_response=$(test_endpoint "POST" "/notifikasi" '{
    "userId": 2,
    "judul": "Test API Notification",
    "pesan": "This is a test notification created via API testing",
    "jenis": "SISTEM_INFO"
}' "$AUTH_HEADER" "Notifications - Create" "201")

NOTIF_ID=$(echo "$create_notif_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 12. NOTIFICATIONS - Mark as Read
if [ -n "$NOTIF_ID" ]; then
    test_endpoint "PUT" "/notifikasi/$NOTIF_ID/read" "" "$AUTH_HEADER" "Notifications - Mark as Read" "200"
fi

# 13. NOTIFICATIONS - Delete Notification
if [ -n "$NOTIF_ID" ]; then
    test_endpoint "DELETE" "/notifikasi/$NOTIF_ID" "" "$AUTH_HEADER" "Notifications - Delete" "200"
fi

echo -e "\n=== 🕐 SHIFT MANAGEMENT TESTS ==="

# 14. SHIFTS - Get All Shifts
test_endpoint "GET" "/shifts" "" "$AUTH_HEADER" "Shifts - Get All" "200"

# 15. SHIFTS - Get Shift Types
test_endpoint "GET" "/shifts/types" "" "$AUTH_HEADER" "Shifts - Get Types" "200"

# 16. SHIFTS - Create Shift
create_shift_response=$(test_endpoint "POST" "/shifts" '{
    "tanggal": "2025-06-25",
    "jammulai": "08:00",
    "jamselesai": "16:00", 
    "lokasishift": "RAWAT_JALAN",
    "idpegawai": "testuser001"
}' "$AUTH_HEADER" "Shifts - Create" "201")

SHIFT_ID=$(echo "$create_shift_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 17. SHIFTS - Get Specific Shift
if [ -n "$SHIFT_ID" ]; then
    test_endpoint "GET" "/shifts/$SHIFT_ID" "" "$AUTH_HEADER" "Shifts - Get Specific" "200"
fi

# 18. SHIFTS - Update Shift
if [ -n "$SHIFT_ID" ]; then
    test_endpoint "PATCH" "/shifts/$SHIFT_ID" '{
        "jammulai": "09:00",
        "jamselesai": "17:00"
    }' "$AUTH_HEADER" "Shifts - Update" "200"
fi

echo -e "\n=== 🔄 SHIFT SWAP REQUEST TESTS ==="

# 19. SHIFT SWAP - Get All Requests
test_endpoint "GET" "/shift-swap-requests" "" "" "Shift Swap - Get All Requests" "200"

# 20. SHIFT SWAP - Create Swap Request
if [ -n "$SHIFT_ID" ] && [ -n "$NEW_USER_ID" ]; then
    create_swap_response=$(test_endpoint "POST" "/shift-swap-requests" '{
        "shiftId": '$SHIFT_ID',
        "toUserId": 2,
        "fromUserId": '$NEW_USER_ID',
        "alasan": "Test swap request via API"
    }' "$AUTH_HEADER" "Shift Swap - Create Request" "201")
    
    SWAP_ID=$(echo "$create_swap_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
fi

# 21. SHIFT SWAP - Get Pending Approvals
test_endpoint "GET" "/shift-swap-requests/pending-approvals/2" "" "" "Shift Swap - Pending Approvals" "200"

echo -e "\n=== 📅 EVENT/KEGIATAN TESTS ==="

# 22. EVENTS - Get All Events
test_endpoint "GET" "/events" "" "" "Events - Get All" "200"

# 23. EVENTS - Create Event
create_event_response=$(test_endpoint "POST" "/events" '{
    "nama": "Test API Event",
    "deskripsi": "Event created via API testing",
    "tanggalMulai": "2025-06-25T10:00:00.000Z",
    "tanggalSelesai": "2025-06-25T12:00:00.000Z",
    "lokasi": "Ruang Meeting",
    "targetPeserta": ["ADMIN", "SUPERVISOR"]
}' "" "Events - Create" "201")

EVENT_ID=$(echo "$create_event_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 24. EVENTS - Get Specific Event
if [ -n "$EVENT_ID" ]; then
    test_endpoint "GET" "/events/$EVENT_ID" "" "" "Events - Get Specific" "200"
fi

# 25. EVENTS - Update Event
if [ -n "$EVENT_ID" ]; then
    test_endpoint "PUT" "/events/$EVENT_ID" '{
        "nama": "Updated Test API Event",
        "deskripsi": "Updated event description"
    }' "" "Events - Update" "200"
fi

# 26. EVENTS - Delete Event
if [ -n "$EVENT_ID" ]; then
    test_endpoint "DELETE" "/events/$EVENT_ID" "" "" "Events - Delete" "200"
fi

echo -e "\n=== ⏰ ATTENDANCE/ABSENSI TESTS ==="

# 27. ABSENSI - Get Dashboard Stats
test_endpoint "GET" "/absensi/dashboard-stats" "" "$AUTH_HEADER" "Absensi - Dashboard Stats" "200"

# 28. ABSENSI - Get Today Attendance
test_endpoint "GET" "/absensi/today" "" "$AUTH_HEADER" "Absensi - Today Attendance" "200"

# 29. ABSENSI - Get My Attendance
test_endpoint "GET" "/absensi/my-attendance" "" "$AUTH_HEADER" "Absensi - My Attendance" "200"

# 30. ABSENSI - Check In (requires shift)
if [ -n "$NEW_USER_ID" ]; then
    # Login as the new user first
    user_login_response=$(test_endpoint "POST" "/auth/login" '{"email": "testuser001@hospital.com", "password": "test123"}' "" "Auth - User Login for Absensi" "200")
    USER_TOKEN=$(echo "$user_login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$USER_TOKEN" ]; then
        USER_AUTH_HEADER="Authorization: Bearer $USER_TOKEN"
        test_endpoint "POST" "/absensi/masuk" '{
            "shiftId": '$SHIFT_ID',
            "latitude": "-1.3000",
            "longitude": "124.8400"
        }' "$USER_AUTH_HEADER" "Absensi - Check In" "201"
    fi
fi

echo -e "\n=== 🧹 CLEANUP TESTS ==="

# Cleanup created test data
if [ -n "$SHIFT_ID" ]; then
    test_endpoint "DELETE" "/shifts/$SHIFT_ID" "" "$AUTH_HEADER" "Cleanup - Delete Test Shift" "200"
fi

if [ -n "$NEW_USER_ID" ]; then
    test_endpoint "DELETE" "/users/$NEW_USER_ID" "" "" "Cleanup - Delete Test User" "200"
fi

echo -e "\n=== 📊 TEST SUMMARY ==="
echo "=============================================="
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC} 🎉"
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Check $TEST_RESULTS_FILE for details.${NC}"
fi

echo -e "\nDetailed results saved to: $TEST_RESULTS_FILE"
echo "=============================================="

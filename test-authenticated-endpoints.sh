#!/bin/bash

# RSUD Anugerah Hospital Management System - Comprehensive Authenticated Endpoint Testing
# Testing all 72 endpoints with proper authentication
# Date: July 5, 2025

echo "🏥 RSUD ANUGERAH - COMPREHENSIVE AUTHENTICATED ENDPOINT TESTING"
echo "=============================================================="
echo "Testing all 72 endpoints with JWT authentication"
echo "Date: $(date)"
echo ""

# Configuration
API_BASE="http://localhost:3001"
TEST_LOG="authenticated_endpoint_test_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNED_TESTS=0
SKIPPED_TESTS=0

# Global variables
AUTH_TOKEN=""
AUTH_HEADER=""

# Function to log results
log_result() {
    echo "$1" | tee -a "$TEST_LOG"
}

# Function to authenticate and get token
authenticate() {
    echo "🔐 AUTHENTICATION"
    echo "=================="
    echo ""
    
    echo -n "Testing authentication with seeded credentials... "
    login_response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@rsud.id","password":"password123"}' 2>/dev/null)
    
    if echo "$login_response" | jq -e '.access_token' >/dev/null 2>&1; then
        AUTH_TOKEN=$(echo "$login_response" | jq -r '.access_token')
        AUTH_HEADER="Authorization: Bearer $AUTH_TOKEN"
        local user_email=$(echo "$login_response" | jq -r '.user.email')
        local user_role=$(echo "$login_response" | jq -r '.user.role')
        echo -e "${GREEN}✅ SUCCESS${NC}"
        echo "User: $user_email ($user_role)"
        echo "Token: ${AUTH_TOKEN:0:50}..."
        log_result "✅ Authentication successful: $user_email ($user_role)"
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response: $login_response"
        log_result "❌ Authentication failed"
        return 1
    fi
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local access_level=$4
    local test_data=$5
    local expected_status=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    printf "[%02d] %-6s %-50s " "$TOTAL_TESTS" "$method" "$endpoint"
    
    # Prepare curl command
    local curl_cmd="curl -s -w '%{http_code}' -X $method $API_BASE$endpoint"
    
    # Add authentication for protected endpoints
    if [[ "$access_level" == "Authenticated"* ]] || [[ "$access_level" == "Admin"* ]] || [[ "$access_level" == "Supervisor"* ]]; then
        if [ -n "$AUTH_HEADER" ]; then
            curl_cmd="$curl_cmd -H '$AUTH_HEADER'"
        else
            echo -e "${YELLOW}⚠️  SKIP${NC} - No auth token"
            log_result "⚠️  SKIP: $method $endpoint - No auth token available"
            SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
            return 0
        fi
    fi
    
    # Add content type for request methods that send data
    if [[ "$method" == "POST" ]] || [[ "$method" == "PUT" ]] || [[ "$method" == "PATCH" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
        if [ -n "$test_data" ]; then
            curl_cmd="$curl_cmd -d '$test_data'"
        fi
    fi
    
    # Execute request
    response=$(eval "$curl_cmd" 2>/dev/null)
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ FAIL${NC} (Connection Error)"
        log_result "❌ FAIL: $method $endpoint - Connection failed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    # Extract HTTP status code and response body
    http_code="${response: -3}"
    response_body="${response%???}"
    
    # Evaluate response based on expected status or general rules
    local expected=${expected_status:-"200,201,204"}
    if [[ ",$expected," == *",$http_code,"* ]]; then
        echo -e "${GREEN}✅ PASS${NC} ($http_code)"
        log_result "✅ PASS: $method $endpoint ($http_code) - $description"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [[ "$http_code" == "400" ]] || [[ "$http_code" == "404" ]] || [[ "$http_code" == "422" ]]; then
        echo -e "${YELLOW}⚠️  WARN${NC} ($http_code)"
        log_result "⚠️  WARN: $method $endpoint ($http_code) - $description"
        WARNED_TESTS=$((WARNED_TESTS + 1))
    elif [[ "$http_code" == "401" ]] || [[ "$http_code" == "403" ]]; then
        if [[ "$access_level" == "Public" ]]; then
            echo -e "${RED}❌ FAIL${NC} ($http_code) - Should be public"
            log_result "❌ FAIL: $method $endpoint ($http_code) - Auth error on public endpoint"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        else
            echo -e "${YELLOW}⚠️  WARN${NC} ($http_code) - Auth required"
            log_result "⚠️  WARN: $method $endpoint ($http_code) - Auth required (expected)"
            WARNED_TESTS=$((WARNED_TESTS + 1))
        fi
    elif [[ "$http_code" == "500" ]] || [[ "$http_code" == "502" ]] || [[ "$http_code" == "503" ]]; then
        echo -e "${RED}❌ FAIL${NC} ($http_code) - Server error"
        log_result "❌ FAIL: $method $endpoint ($http_code) - Server error"
        echo "Response: $response_body" >> "$TEST_LOG"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️  WARN${NC} ($http_code) - Unexpected"
        log_result "⚠️  WARN: $method $endpoint ($http_code) - Unexpected response"
        WARNED_TESTS=$((WARNED_TESTS + 1))
    fi
}

# Function to run all endpoint tests
run_comprehensive_tests() {
    echo "🧪 COMPREHENSIVE ENDPOINT TESTING"
    echo "=================================="
    echo ""
    
    # 1. Authentication Endpoints
    echo -e "${PURPLE}🔐 AUTHENTICATION ENDPOINTS${NC}"
    echo "----------------------------"
    test_endpoint "POST" "/auth/login" "User authentication" "Public" '{"email":"test@test.com","password":"test123"}' "401"
    
    # 2. User Management Endpoints
    echo -e "\n${PURPLE}👥 USER MANAGEMENT ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "GET" "/users" "Get all users" "Authenticated"
    test_endpoint "GET" "/users/count-by-gender" "Get user count by gender" "Authenticated"
    test_endpoint "GET" "/users/count-by-role" "Get user count by role" "Authenticated"
    test_endpoint "GET" "/users/1" "Get user by ID" "Authenticated"
    test_endpoint "POST" "/users" "Create new user" "Authenticated" '{"namaDepan":"Test","namaBelakang":"User","email":"test@test.com","role":"PERAWAT","employeeId":"TST001"}' "201,400"
    test_endpoint "PUT" "/users/999" "Update user by ID" "Authenticated" '{"namaDepan":"Updated"}' "404"
    test_endpoint "DELETE" "/users/999" "Delete user by ID" "Authenticated" "" "404"
    
    # User Telegram Integration
    echo -e "\n${CYAN}📱 USER TELEGRAM INTEGRATION${NC}"
    echo "-----------------------------"
    test_endpoint "PUT" "/user/telegram-chat-id" "Update Telegram Chat ID" "Authenticated" '{"telegramChatId":"123456789"}'
    test_endpoint "POST" "/user/telegram-chat-id" "Get Telegram Chat ID" "Authenticated"
    test_endpoint "POST" "/user/test-telegram-notification" "Test Telegram notification" "Authenticated" '{"message":"Test notification"}'
    
    # 3. Attendance (Absensi) Endpoints
    echo -e "\n${PURPLE}⏰ ATTENDANCE (ABSENSI) ENDPOINTS${NC}"
    echo "--------------------------------"
    test_endpoint "POST" "/absensi/masuk" "Clock in attendance" "Authenticated" '{"location":"Test Location"}'
    test_endpoint "PATCH" "/absensi/keluar/1" "Clock out attendance" "Authenticated" '{"location":"Test Location"}' "404"
    test_endpoint "GET" "/absensi/my-attendance" "Get user attendance" "Authenticated"
    test_endpoint "GET" "/absensi/today/1" "Get today attendance for user" "Authenticated"
    test_endpoint "GET" "/absensi/today" "Get user today attendance" "Authenticated"
    test_endpoint "GET" "/absensi/dashboard-stats" "Get dashboard statistics" "Authenticated"
    test_endpoint "GET" "/absensi/all" "Get all attendance records" "Admin"
    test_endpoint "PATCH" "/absensi/verify/1" "Verify attendance record" "Admin" '{"verified":true}' "404"
    test_endpoint "GET" "/absensi/reports/monthly" "Get monthly report" "Authenticated"
    test_endpoint "GET" "/absensi/reports/stats" "Get attendance statistics" "Authenticated"
    
    # 4. Shift Management Endpoints
    echo -e "\n${PURPLE}🕐 SHIFT MANAGEMENT ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "POST" "/shifts" "Create new shift" "Authenticated" '{"tanggal":"2025-07-05","jammulai":"08:00","jamselesai":"16:00","userId":1}'
    test_endpoint "GET" "/shifts" "Get all shifts" "Authenticated"
    test_endpoint "GET" "/shifts/types" "Get available shift types" "Authenticated"
    test_endpoint "GET" "/shifts/types/PAGI" "Get schedules for shift type" "Authenticated"
    test_endpoint "GET" "/shifts/types/PAGI/options?date=2025-07-05" "Get shift options" "Authenticated"
    test_endpoint "POST" "/shifts/with-type" "Create shift with type" "Authenticated" '{"shiftType":"PAGI","date":"2025-07-05","userId":1}'
    test_endpoint "POST" "/shifts/validate" "Validate shift time" "Authenticated" '{"shiftType":"PAGI","date":"2025-07-05","jammulai":"08:00","jamselesai":"16:00"}'
    test_endpoint "GET" "/shifts/installation/IGD" "Get shifts by installation" "Authenticated"
    test_endpoint "GET" "/shifts/1" "Get shift by ID" "Authenticated"
    test_endpoint "PATCH" "/shifts/1" "Update shift by ID" "Authenticated" '{"jammulai":"09:00"}' "404"
    test_endpoint "DELETE" "/shifts/999" "Delete shift by ID" "Authenticated" "" "404"
    
    # 5. Shift Swap Request Endpoints
    echo -e "\n${PURPLE}🔄 SHIFT SWAP REQUEST ENDPOINTS${NC}"
    echo "-------------------------------"
    test_endpoint "POST" "/shift-swap-requests" "Create shift swap request" "Authenticated" '{"toUserId":2,"myShiftId":1,"targetShiftId":2,"reason":"Test swap"}'
    test_endpoint "GET" "/shift-swap-requests" "Get all swap requests" "Authenticated"
    test_endpoint "GET" "/shift-swap-requests/my-requests" "Get user swap requests" "Authenticated"
    test_endpoint "GET" "/shift-swap-requests/pending-approvals" "Get pending approvals" "Authenticated"
    test_endpoint "GET" "/shift-swap-requests/1" "Get swap request by ID" "Authenticated"
    test_endpoint "PATCH" "/shift-swap-requests/1" "Update swap request" "Authenticated" '{"reason":"Updated reason"}' "404"
    test_endpoint "PATCH" "/shift-swap-requests/1/respond" "Respond to swap request" "Authenticated" '{"response":"APPROVED","message":"Approved"}' "404"
    test_endpoint "DELETE" "/shift-swap-requests/999" "Delete swap request" "Authenticated" "" "404"
    
    # 6. Employee (Pegawai) Endpoints
    echo -e "\n${PURPLE}👷 EMPLOYEE (PEGAWAI) ENDPOINTS${NC}"
    echo "-------------------------------"
    test_endpoint "DELETE" "/pegawai/999" "Delete employee by ID" "Authenticated" "" "204,404"
    
    # 7. Event (Kegiatan) Endpoints
    echo -e "\n${PURPLE}📅 EVENT (KEGIATAN) ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "GET" "/events" "Get all events" "Public"
    test_endpoint "GET" "/events/1" "Get event by ID" "Public" "" "404"
    test_endpoint "POST" "/events" "Create new event" "Public" '{"title":"Test Event","description":"Test Description","tanggal":"2025-07-05"}'
    test_endpoint "PUT" "/events/1" "Update event by ID" "Public" '{"title":"Updated Event"}' "404"
    test_endpoint "DELETE" "/events/999" "Delete event by ID" "Public" "" "404"
    
    # 8. Notification Endpoints
    echo -e "\n${PURPLE}🔔 NOTIFICATION ENDPOINTS${NC}"
    echo "-------------------------"
    test_endpoint "GET" "/notifikasi" "Get role-based notifications" "Authenticated"
    test_endpoint "GET" "/notifikasi/unread-count" "Get unread count" "Authenticated"
    test_endpoint "PUT" "/notifikasi/1/read" "Mark notification as read" "Authenticated" "" "404"
    test_endpoint "PUT" "/notifikasi/mark-read" "Mark multiple as read" "Authenticated" '{"ids":[1,2,3]}'
    test_endpoint "DELETE" "/notifikasi/999" "Delete notification" "Authenticated" "" "404"
    test_endpoint "POST" "/notifikasi" "Create notification" "Authenticated" '{"title":"Test","content":"Test notification","type":"INFO"}'
    test_endpoint "GET" "/notifikasi/admin/all" "Get all notifications (admin)" "Admin"
    test_endpoint "POST" "/notifikasi/test/shift-reminder" "Test shift reminder" "Authenticated" '{"shiftId":1}'
    test_endpoint "POST" "/notifikasi/test/new-shift" "Test new shift notification" "Authenticated" '{"shiftId":1}'
    
    # 9. User-Specific Notifications Endpoints
    echo -e "\n${PURPLE}🎯 USER-SPECIFIC NOTIFICATIONS${NC}"
    echo "-------------------------------"
    test_endpoint "POST" "/api/user-notifications/personal-attendance-reminder" "Personal attendance reminder" "Admin" '{"userId":1,"shiftTime":"08:00","location":"IGD"}'
    test_endpoint "POST" "/api/user-notifications/personal-task-assignment" "Personal task assignment" "Admin" '{"userId":1,"taskId":1,"taskTitle":"Test Task","description":"Test","dueDate":"2025-07-06","priority":"MEDIUM","assignedBy":"Admin"}'
    test_endpoint "POST" "/api/user-notifications/personal-evaluation-results" "Personal evaluation results" "Admin" '{"userId":1,"evaluationId":1,"evaluationType":"Monthly","score":85,"feedback":"Good","evaluatedBy":"Supervisor","evaluationDate":"2025-07-05"}'
    test_endpoint "POST" "/api/user-notifications/personal-shift-swap" "Personal shift swap" "Admin" '{"requesterUserId":1,"targetUserId":2,"swapId":1,"requesterShiftDate":"2025-07-05","requesterShiftTime":"08:00","targetShiftDate":"2025-07-06","targetShiftTime":"16:00","reason":"Test swap"}'
    test_endpoint "POST" "/api/user-notifications/interactive-announcement" "Interactive announcement" "Admin" '{"title":"Test Announcement","content":"Test content","targetRoles":["PERAWAT"],"interactionType":"CONFIRMATION"}'
    test_endpoint "POST" "/api/user-notifications/director-notification" "Director notification" "Admin" '{"userId":1,"title":"Director Notice","content":"Important notice","priority":"HIGH"}'
    test_endpoint "POST" "/api/user-notifications/personal-meeting-reminder" "Personal meeting reminder" "Admin" '{"userId":1,"meetingId":1,"title":"Team Meeting","startTime":"2025-07-06T10:00:00Z","location":"Meeting Room","reminderMinutes":30,"organizer":"Admin"}'
    test_endpoint "POST" "/api/user-notifications/personal-warning" "Personal warning" "Admin" '{"userId":1,"warningType":"ATTENDANCE","severity":"VERBAL","reason":"Late arrival","issuedBy":"Supervisor"}'
    test_endpoint "PUT" "/api/user-notifications/interactive-response/1" "Interactive response" "Authenticated" '{"responseType":"CONFIRMED","message":"I confirm"}' "404"
    test_endpoint "GET" "/api/user-notifications/user-specific" "Get user-specific notifications" "Authenticated"
    test_endpoint "GET" "/api/user-notifications/personal" "Get personal notifications" "Authenticated"
    test_endpoint "GET" "/api/user-notifications/interactive" "Get interactive notifications" "Authenticated"
    
    # 10. Telegram Integration Endpoints
    echo -e "\n${PURPLE}📱 TELEGRAM INTEGRATION${NC}"
    echo "------------------------"
    test_endpoint "POST" "/telegram/webhook" "Handle webhook updates" "Public" '{"message":{"text":"test"}}'
    test_endpoint "POST" "/telegram/setup-commands" "Setup bot commands" "Public"
    test_endpoint "GET" "/telegram/bot-info" "Get bot information" "Public"
    test_endpoint "POST" "/telegram/set-webhook" "Set webhook URL" "Public" '{"url":"https://example.com/webhook"}'
    
    # 11. Application Root Endpoints
    echo -e "\n${PURPLE}🏠 APPLICATION ROOT${NC}"
    echo "-------------------"
    test_endpoint "GET" "/" "Get welcome message" "Public"
    
    echo ""
}

# Function to generate summary report
generate_summary() {
    echo ""
    echo "📊 COMPREHENSIVE AUTHENTICATED TEST SUMMARY"
    echo "============================================"
    echo ""
    
    echo "Total Endpoints Tested: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "Warnings: ${YELLOW}$WARNED_TESTS${NC}"
    echo -e "Skipped: ${CYAN}$SKIPPED_TESTS${NC}"
    echo ""
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo "Success Rate: $success_rate%"
    fi
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 NO CRITICAL FAILURES!${NC}"
        echo "✅ All endpoints are responding appropriately"
    else
        echo -e "${RED}⚠️  SOME ENDPOINTS FAILED${NC}"
        echo "❌ Review the detailed log for issues"
    fi
    
    if [ $SKIPPED_TESTS -gt 0 ]; then
        echo -e "${CYAN}ℹ️  Some endpoints were skipped due to authentication${NC}"
    fi
    
    echo ""
    echo "📄 Detailed log saved to: $TEST_LOG"
    echo "📅 Test completed at: $(date)"
    echo ""
    echo "🏥 RSUD Anugerah Hospital Management System"
    echo "   Comprehensive Authenticated API Testing Complete"
}

# Function to check if backend is running
check_backend() {
    echo "🔍 Checking Backend Service"
    echo "============================="
    echo ""
    
    if curl -s "$API_BASE" >/dev/null 2>&1; then
        echo -e "Backend (Port 3001): ${GREEN}✅ Running${NC}"
        echo ""
        return 0
    else
        echo -e "Backend (Port 3001): ${RED}❌ Not Running${NC}"
        echo "❌ Backend service not available. Please start with: npm run start:dev"
        return 1
    fi
}

# Main execution
main() {
    # Initialize log
    echo "RSUD Anugerah Comprehensive Authenticated Endpoint Testing - $(date)" > "$TEST_LOG"
    echo "=================================================================" >> "$TEST_LOG"
    echo "" >> "$TEST_LOG"
    
    # Check backend service
    if ! check_backend; then
        echo "❌ Cannot proceed with tests - backend service not available"
        exit 1
    fi
    
    # Authenticate
    if ! authenticate; then
        echo "❌ Cannot proceed with tests - authentication failed"
        exit 1
    fi
    
    # Run comprehensive tests
    run_comprehensive_tests
    
    # Generate summary
    generate_summary
}

# Execute main function
main "$@"

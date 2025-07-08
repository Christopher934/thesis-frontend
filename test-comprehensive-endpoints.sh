#!/bin/bash

# RSUD Anugerah Hospital Management System - Comprehensive Endpoint Testing
# Testing all 72 endpoints from the API documentation
# Date: July 5, 2025

echo "🏥 RSUD ANUGERAH - COMPREHENSIVE ENDPOINT TESTING"
echo "=================================================="
echo "Testing all 72 endpoints from API documentation"
echo "Date: $(date)"
echo ""

# Configuration
API_BASE="http://localhost:3001"
TEST_LOG="comprehensive_endpoint_test_$(date +%Y%m%d_%H%M%S).log"

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

# Function to log results
log_result() {
    echo "$1" | tee -a "$TEST_LOG"
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local access_level=$4
    local auth_header=$5
    local test_data=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "[$TOTAL_TESTS] Testing $method $endpoint "
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method $API_BASE$endpoint"
    
    # Add headers based on access level
    if [[ "$access_level" == "Authenticated"* ]] || [[ "$access_level" == "Admin"* ]] || [[ "$access_level" == "Supervisor"* ]]; then
        if [ -n "$auth_header" ]; then
            curl_cmd="$curl_cmd -H '$auth_header'"
        else
            echo -e "${YELLOW}⚠️  SKIP${NC} - No auth token for protected endpoint"
            log_result "⚠️  SKIP: $method $endpoint - No auth token available"
            WARNED_TESTS=$((WARNED_TESTS + 1))
            return 0
        fi
    fi
    
    # Add content type for POST/PUT/PATCH
    if [[ "$method" == "POST" ]] || [[ "$method" == "PUT" ]] || [[ "$method" == "PATCH" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
        if [ -n "$test_data" ]; then
            curl_cmd="$curl_cmd -d '$test_data'"
        fi
    fi
    
    # Execute request
    response=$(eval "$curl_cmd" 2>/dev/null)
    http_code="${response: -3}"
    response_body="${response%???}"
    
    # Evaluate response
    case $http_code in
        200|201|204)
            echo -e "${GREEN}✅ PASS${NC} ($http_code) - $description"
            log_result "✅ PASS: $method $endpoint ($http_code) - $description"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            ;;
        400|404|422)
            echo -e "${YELLOW}⚠️  WARN${NC} ($http_code) - $description"
            log_result "⚠️  WARN: $method $endpoint ($http_code) - $description"
            WARNED_TESTS=$((WARNED_TESTS + 1))
            ;;
        401|403)
            if [[ "$access_level" == "Public" ]]; then
                echo -e "${RED}❌ FAIL${NC} ($http_code) - Should be public but got auth error"
                log_result "❌ FAIL: $method $endpoint ($http_code) - Auth error on public endpoint"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            else
                echo -e "${YELLOW}⚠️  WARN${NC} ($http_code) - Auth required (expected)"
                log_result "⚠️  WARN: $method $endpoint ($http_code) - Auth required"
                WARNED_TESTS=$((WARNED_TESTS + 1))
            fi
            ;;
        500|502|503)
            echo -e "${RED}❌ FAIL${NC} ($http_code) - Server error"
            log_result "❌ FAIL: $method $endpoint ($http_code) - Server error"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            ;;
        000)
            echo -e "${RED}❌ FAIL${NC} (000) - Connection failed"
            log_result "❌ FAIL: $method $endpoint (000) - Connection failed"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            ;;
        *)
            echo -e "${YELLOW}⚠️  WARN${NC} ($http_code) - Unexpected response"
            log_result "⚠️  WARN: $method $endpoint ($http_code) - Unexpected response"
            WARNED_TESTS=$((WARNED_TESTS + 1))
            ;;
    esac
}

# Function to check if services are running
check_services() {
    echo "🔍 Checking Services Status"
    echo "----------------------------"
    
    # Check backend
    if curl -s "$API_BASE" >/dev/null 2>&1; then
        echo -e "Backend (Port 3001): ${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "Backend (Port 3001): ${RED}❌ Not Running${NC}"
        echo "❌ Backend service not available. Please start with: npm run start:dev"
        return 1
    fi
}

# Function to get auth token
get_auth_token() {
    echo "🔐 Attempting to get authentication token..."
    
    # Try seeded login credentials
    local login_attempts=(
        '{"email":"admin@rsud.id","password":"password123"}'
        '{"email":"supervisor1@rsud.id","password":"password123"}'
        '{"email":"perawat1@rsud.id","password":"password123"}'
        '{"email":"staff1@rsud.id","password":"password123"}'
    )
    
    for login_data in "${login_attempts[@]}"; do
        login_response=$(curl -s -X POST "$API_BASE/auth/login" \
            -H "Content-Type: application/json" \
            -d "$login_data" 2>/dev/null)
        
        if echo "$login_response" | jq -e '.access_token' >/dev/null 2>&1; then
            token=$(echo "$login_response" | jq -r '.access_token')
            echo -e "Authentication: ${GREEN}✅ Success${NC}"
            AUTH_HEADER="Authorization: Bearer $token"
            return 0
        fi
    done
    
    echo -e "Authentication: ${YELLOW}⚠️  Failed (testing public endpoints only)${NC}"
    AUTH_HEADER=""
    return 1
}

# Main testing function
run_comprehensive_tests() {
    echo ""
    echo "🧪 COMPREHENSIVE ENDPOINT TESTING"
    echo "=================================="
    echo ""
    
    # Get authentication token
    get_auth_token
    echo ""
    
    # 1. Authentication Endpoints
    echo -e "${PURPLE}🔐 AUTHENTICATION ENDPOINTS${NC}"
    echo "----------------------------"
    test_endpoint "POST" "/auth/login" "User authentication with email and password" "Public" "" '{"email":"test@test.com","password":"test123"}'
    
    # 2. User Management Endpoints
    echo -e "\n${PURPLE}👥 USER MANAGEMENT ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "GET" "/users" "Get all users" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/users/count-by-gender" "Get user count by gender" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/users/count-by-role" "Get user count by role" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/users/1" "Get user by ID" "Authenticated" "$AUTH_HEADER"
    test_endpoint "POST" "/users" "Create new user" "Authenticated" "$AUTH_HEADER" '{"namaDepan":"Test","namaBelakang":"User","email":"test@test.com","role":"PERAWAT"}'
    test_endpoint "PUT" "/users/999" "Update user by ID" "Authenticated" "$AUTH_HEADER" '{"namaDepan":"Updated"}'
    test_endpoint "DELETE" "/users/999" "Delete user by ID" "Authenticated" "$AUTH_HEADER"
    
    # User Telegram Integration
    echo -e "\n${CYAN}📱 USER TELEGRAM INTEGRATION${NC}"
    echo "-----------------------------"
    test_endpoint "PUT" "/user/telegram-chat-id" "Update user's Telegram Chat ID" "Authenticated" "$AUTH_HEADER" '{"telegramChatId":"123456789"}'
    test_endpoint "POST" "/user/telegram-chat-id" "Get user's Telegram Chat ID" "Authenticated" "$AUTH_HEADER"
    test_endpoint "POST" "/user/test-telegram-notification" "Send test Telegram notification" "Authenticated" "$AUTH_HEADER" '{"message":"Test notification"}'
    
    # 3. Attendance (Absensi) Endpoints
    echo -e "\n${PURPLE}⏰ ATTENDANCE (ABSENSI) ENDPOINTS${NC}"
    echo "--------------------------------"
    test_endpoint "POST" "/absensi/masuk" "Clock in attendance" "Authenticated" "$AUTH_HEADER" '{"location":"Test Location"}'
    test_endpoint "PATCH" "/absensi/keluar/1" "Clock out attendance" "Authenticated" "$AUTH_HEADER" '{"location":"Test Location"}'
    test_endpoint "GET" "/absensi/my-attendance" "Get current user's attendance records" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/absensi/today/1" "Get today's attendance for specific user" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/absensi/today" "Get current user's today attendance" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/absensi/dashboard-stats" "Get dashboard statistics" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/absensi/all" "Get all attendance records" "Admin/Supervisor" "$AUTH_HEADER"
    test_endpoint "PATCH" "/absensi/verify/1" "Verify attendance record" "Admin/Supervisor" "$AUTH_HEADER" '{"verified":true}'
    test_endpoint "GET" "/absensi/reports/monthly" "Get monthly attendance report" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/absensi/reports/stats" "Get attendance statistics" "Authenticated" "$AUTH_HEADER"
    
    # 4. Shift Management Endpoints
    echo -e "\n${PURPLE}🕐 SHIFT MANAGEMENT ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "POST" "/shifts" "Create new shift" "Authenticated" "$AUTH_HEADER" '{"tanggal":"2025-07-05","jammulai":"08:00","jamselesai":"16:00"}'
    test_endpoint "GET" "/shifts" "Get all shifts" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shifts/types" "Get all available shift types" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shifts/types/PAGI" "Get schedules for specific shift type" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shifts/types/PAGI/options?date=2025-07-05" "Get shift options for date and type" "Authenticated" "$AUTH_HEADER"
    test_endpoint "POST" "/shifts/with-type" "Create shift using official shift type system" "Authenticated" "$AUTH_HEADER" '{"shiftType":"PAGI","date":"2025-07-05"}'
    test_endpoint "POST" "/shifts/validate" "Validate shift time for given type and date" "Authenticated" "$AUTH_HEADER" '{"shiftType":"PAGI","date":"2025-07-05","jammulai":"08:00","jamselesai":"16:00"}'
    test_endpoint "GET" "/shifts/installation/IGD" "Get shifts by installation type" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shifts/1" "Get shift by ID" "Authenticated" "$AUTH_HEADER"
    test_endpoint "PATCH" "/shifts/1" "Update shift by ID" "Authenticated" "$AUTH_HEADER" '{"jammulai":"09:00"}'
    test_endpoint "DELETE" "/shifts/999" "Delete shift by ID" "Authenticated" "$AUTH_HEADER"
    
    # 5. Shift Swap Request Endpoints
    echo -e "\n${PURPLE}🔄 SHIFT SWAP REQUEST ENDPOINTS${NC}"
    echo "-------------------------------"
    test_endpoint "POST" "/shift-swap-requests" "Create shift swap request" "Authenticated" "$AUTH_HEADER" '{"toUserId":2,"myShiftId":1,"targetShiftId":2,"reason":"Test swap"}'
    test_endpoint "GET" "/shift-swap-requests" "Get all swap requests" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shift-swap-requests/my-requests" "Get current user's swap requests" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shift-swap-requests/pending-approvals" "Get pending approvals for current user" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/shift-swap-requests/1" "Get swap request by ID" "Authenticated" "$AUTH_HEADER"
    test_endpoint "PATCH" "/shift-swap-requests/1" "Update swap request" "Authenticated" "$AUTH_HEADER" '{"reason":"Updated reason"}'
    test_endpoint "PATCH" "/shift-swap-requests/1/respond" "Respond to swap request" "Authenticated" "$AUTH_HEADER" '{"response":"APPROVED","message":"Approved"}'
    test_endpoint "DELETE" "/shift-swap-requests/999" "Delete swap request" "Authenticated" "$AUTH_HEADER"
    
    # 6. Employee (Pegawai) Endpoints
    echo -e "\n${PURPLE}👷 EMPLOYEE (PEGAWAI) ENDPOINTS${NC}"
    echo "-------------------------------"
    test_endpoint "DELETE" "/pegawai/999" "Delete employee by ID" "Authenticated" "$AUTH_HEADER"
    
    # 7. Event (Kegiatan) Endpoints
    echo -e "\n${PURPLE}📅 EVENT (KEGIATAN) ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "GET" "/events" "Get all events" "Public" ""
    test_endpoint "GET" "/events/1" "Get event by ID" "Public" ""
    test_endpoint "POST" "/events" "Create new event" "Public" "" '{"title":"Test Event","description":"Test Description","tanggal":"2025-07-05"}'
    test_endpoint "PUT" "/events/1" "Update event by ID" "Public" "" '{"title":"Updated Event"}'
    test_endpoint "DELETE" "/events/999" "Delete event by ID" "Public" ""
    
    # 8. Notification Endpoints
    echo -e "\n${PURPLE}🔔 NOTIFICATION ENDPOINTS${NC}"
    echo "-------------------------"
    test_endpoint "GET" "/notifikasi" "Get role-based notifications for current user" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/notifikasi/unread-count" "Get unread notification count by role" "Authenticated" "$AUTH_HEADER"
    test_endpoint "PUT" "/notifikasi/1/read" "Mark notification as read" "Authenticated" "$AUTH_HEADER"
    test_endpoint "PUT" "/notifikasi/mark-read" "Mark multiple notifications as read" "Authenticated" "$AUTH_HEADER" '{"ids":[1,2,3]}'
    test_endpoint "DELETE" "/notifikasi/999" "Delete notification" "Authenticated" "$AUTH_HEADER"
    test_endpoint "POST" "/notifikasi" "Create notification" "Authenticated" "$AUTH_HEADER" '{"title":"Test","content":"Test notification","type":"INFO"}'
    test_endpoint "GET" "/notifikasi/admin/all" "Get all notifications for admin view" "Admin" "$AUTH_HEADER"
    test_endpoint "POST" "/notifikasi/test/shift-reminder" "Test shift reminder notification" "Authenticated" "$AUTH_HEADER" '{"shiftId":1}'
    test_endpoint "POST" "/notifikasi/test/new-shift" "Test new shift notification" "Authenticated" "$AUTH_HEADER" '{"shiftId":1}'
    
    # 9. User-Specific Notifications Endpoints
    echo -e "\n${PURPLE}🎯 USER-SPECIFIC NOTIFICATIONS ENDPOINTS${NC}"
    echo "----------------------------------------"
    test_endpoint "POST" "/api/user-notifications/personal-attendance-reminder" "Send personal attendance reminder" "Admin/Supervisor" "$AUTH_HEADER" '{"userId":1,"shiftTime":"08:00","location":"IGD"}'
    test_endpoint "POST" "/api/user-notifications/personal-task-assignment" "Send personal task assignment" "Admin/Supervisor" "$AUTH_HEADER" '{"userId":1,"taskId":1,"taskTitle":"Test Task","description":"Test","dueDate":"2025-07-06","priority":"MEDIUM","assignedBy":"Admin"}'
    test_endpoint "POST" "/api/user-notifications/personal-evaluation-results" "Send personal evaluation results" "Admin/Supervisor" "$AUTH_HEADER" '{"userId":1,"evaluationId":1,"evaluationType":"Monthly","score":85,"feedback":"Good","evaluatedBy":"Supervisor","evaluationDate":"2025-07-05"}'
    test_endpoint "POST" "/api/user-notifications/personal-shift-swap" "Send personal shift swap confirmation" "Admin/Supervisor/Perawat/Dokter" "$AUTH_HEADER" '{"requesterUserId":1,"targetUserId":2,"swapId":1,"requesterShiftDate":"2025-07-05","requesterShiftTime":"08:00","targetShiftDate":"2025-07-06","targetShiftTime":"16:00","reason":"Test swap"}'
    test_endpoint "POST" "/api/user-notifications/interactive-announcement" "Send interactive announcement" "Admin/Supervisor" "$AUTH_HEADER" '{"title":"Test Announcement","content":"Test content","targetRoles":["PERAWAT"],"interactionType":"CONFIRMATION"}'
    test_endpoint "POST" "/api/user-notifications/director-notification" "Send director notification" "Admin" "$AUTH_HEADER" '{"userId":1,"title":"Director Notice","content":"Important notice","priority":"HIGH"}'
    test_endpoint "POST" "/api/user-notifications/personal-meeting-reminder" "Send personal meeting reminder" "Admin/Supervisor" "$AUTH_HEADER" '{"userId":1,"meetingId":1,"title":"Team Meeting","startTime":"2025-07-06T10:00:00Z","location":"Meeting Room","reminderMinutes":30,"organizer":"Admin"}'
    test_endpoint "POST" "/api/user-notifications/personal-warning" "Send personal warning" "Admin/Supervisor" "$AUTH_HEADER" '{"userId":1,"warningType":"ATTENDANCE","severity":"VERBAL","reason":"Late arrival","issuedBy":"Supervisor"}'
    test_endpoint "PUT" "/api/user-notifications/interactive-response/1" "Handle interactive notification response" "Authenticated" "$AUTH_HEADER" '{"responseType":"CONFIRMED","message":"I confirm"}'
    test_endpoint "GET" "/api/user-notifications/user-specific" "Get user-specific notifications with filtering" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/api/user-notifications/personal" "Get personal notifications only" "Authenticated" "$AUTH_HEADER"
    test_endpoint "GET" "/api/user-notifications/interactive" "Get interactive notifications requiring response" "Authenticated" "$AUTH_HEADER"
    
    # 10. Telegram Integration Endpoints
    echo -e "\n${PURPLE}📱 TELEGRAM INTEGRATION ENDPOINTS${NC}"
    echo "---------------------------------"
    test_endpoint "POST" "/telegram/webhook" "Handle Telegram bot webhook updates" "Public (Telegram)" "" '{"message":{"text":"test"}}'
    test_endpoint "POST" "/telegram/setup-commands" "Setup Telegram bot commands" "Public" ""
    test_endpoint "GET" "/telegram/bot-info" "Get Telegram bot information" "Public" ""
    test_endpoint "POST" "/telegram/set-webhook" "Set webhook URL for production" "Public" "" '{"url":"https://example.com/webhook"}'
    
    # 11. Application Root Endpoints
    echo -e "\n${PURPLE}🏠 APPLICATION ROOT ENDPOINTS${NC}"
    echo "-----------------------------"
    test_endpoint "GET" "/" "Get application welcome message" "Public" ""
    
    echo ""
}

# Function to generate summary report
generate_summary() {
    echo ""
    echo "📊 COMPREHENSIVE TEST SUMMARY REPORT"
    echo "====================================="
    echo ""
    
    echo "Total Endpoints Tested: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "Warnings: ${YELLOW}$WARNED_TESTS${NC}"
    echo ""
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: $success_rate%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 NO CRITICAL FAILURES!${NC}"
        echo "✅ All endpoints are responding appropriately"
    else
        echo -e "${RED}⚠️  SOME ENDPOINTS FAILED${NC}"
        echo "❌ Review the detailed log for issues"
    fi
    
    echo ""
    echo "📄 Detailed log saved to: $TEST_LOG"
    echo "📅 Test completed at: $(date)"
    echo ""
    echo "🏥 RSUD Anugerah Hospital Management System"
    echo "   Comprehensive API Endpoint Testing Complete"
}

# Main execution
main() {
    # Initialize log
    echo "RSUD Anugerah Comprehensive Endpoint Testing - $(date)" > "$TEST_LOG"
    echo "=======================================================" >> "$TEST_LOG"
    echo "" >> "$TEST_LOG"
    
    # Check services
    if ! check_services; then
        echo "❌ Cannot proceed with tests - backend service not available"
        exit 1
    fi
    
    # Run comprehensive tests
    run_comprehensive_tests
    
    # Generate summary
    generate_summary
}

# Execute main function
main "$@"

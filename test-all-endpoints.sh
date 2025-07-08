#!/bin/bash

# RSUD Anugerah Hospital Management System - Complete Endpoint Testing
# Testing Employee ID synchronization across all endpoints
# Date: July 4, 2025

echo "🏥 RSUD ANUGERAH - COMPLETE ENDPOINT TESTING"
echo "=============================================="
echo "Testing Employee ID synchronization across all endpoints"
echo "Date: $(date)"
echo ""

# Configuration
API_BASE="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
TEST_LOG="endpoint_test_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log results
log_result() {
    echo "$1" | tee -a "$TEST_LOG"
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_field=$4
    local auth_header=$5
    
    echo -n "Testing $method $endpoint - $description... "
    
    if [ -n "$auth_header" ]; then
        response=$(curl -s -X "$method" "$API_BASE$endpoint" -H "$auth_header" -H "Accept: application/json" 2>/dev/null)
    else
        response=$(curl -s -X "$method" "$API_BASE$endpoint" -H "Accept: application/json" 2>/dev/null)
    fi
    
    if [ $? -eq 0 ]; then
        if [ -n "$expected_field" ]; then
            if echo "$response" | jq -e ".[0].$expected_field" >/dev/null 2>&1 || echo "$response" | jq -e ".$expected_field" >/dev/null 2>&1; then
                echo -e "${GREEN}✅ PASS${NC} - $expected_field field present"
                log_result "✅ PASS: $method $endpoint - $expected_field field present"
                return 0
            else
                echo -e "${RED}❌ FAIL${NC} - $expected_field field missing"
                log_result "❌ FAIL: $method $endpoint - $expected_field field missing"
                echo "Response: $response" >> "$TEST_LOG"
                return 1
            fi
        else
            if echo "$response" | jq empty >/dev/null 2>&1; then
                echo -e "${GREEN}✅ PASS${NC} - Valid JSON response"
                log_result "✅ PASS: $method $endpoint - Valid JSON response"
                return 0
            else
                echo -e "${YELLOW}⚠️  WARN${NC} - Response: $response"
                log_result "⚠️  WARN: $method $endpoint - Response: $response"
                return 1
            fi
        fi
    else
        echo -e "${RED}❌ FAIL${NC} - Connection failed"
        log_result "❌ FAIL: $method $endpoint - Connection failed"
        return 1
    fi
}

# Function to check if services are running
check_services() {
    echo "🔍 Checking Services Status"
    echo "----------------------------"
    
    # Check backend
    if curl -s "$API_BASE/health" >/dev/null 2>&1 || curl -s "$API_BASE" >/dev/null 2>&1; then
        echo -e "Backend (Port 3001): ${GREEN}✅ Running${NC}"
    else
        echo -e "Backend (Port 3001): ${RED}❌ Not Running${NC}"
        echo "❌ Backend service not available. Please start with: npm run start:dev"
        return 1
    fi
    
    # Check frontend
    if curl -s "$FRONTEND_URL" >/dev/null 2>&1; then
        echo -e "Frontend (Port 3000): ${GREEN}✅ Running${NC}"
    else
        echo -e "Frontend (Port 3000): ${YELLOW}⚠️  Not Running${NC}"
        echo "⚠️  Frontend service not available. Tests will continue with backend only."
    fi
    
    echo ""
    return 0
}

# Function to get auth token (if available)
get_auth_token() {
    echo "🔐 Attempting to get authentication token..."
    
    # Try to login with admin credentials
    login_response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' 2>/dev/null)
    
    if echo "$login_response" | jq -e '.access_token' >/dev/null 2>&1; then
        token=$(echo "$login_response" | jq -r '.access_token')
        echo -e "Authentication: ${GREEN}✅ Success${NC}"
        echo "Authorization: Bearer $token"
        return 0
    else
        echo -e "Authentication: ${YELLOW}⚠️  No token (testing public endpoints only)${NC}"
        echo ""
        return 1
    fi
}

# Main testing function
run_endpoint_tests() {
    echo "🧪 ENDPOINT TESTING - EMPLOYEE ID VERIFICATION"
    echo "==============================================="
    echo ""
    
    # Get authentication token
    if get_auth_token; then
        AUTH_HEADER="Authorization: Bearer $token"
    else
        AUTH_HEADER=""
    fi
    
    echo ""
    echo "📋 Testing Core Endpoints"
    echo "-------------------------"
    
    # Test Users endpoints
    echo -e "\n${BLUE}👥 USER ENDPOINTS${NC}"
    test_endpoint "GET" "/users" "Get all users" "employeeId" "$AUTH_HEADER"
    test_endpoint "GET" "/users/1" "Get specific user" "employeeId" "$AUTH_HEADER"
    
    # Test Shifts endpoints
    echo -e "\n${BLUE}🕐 SHIFT ENDPOINTS${NC}"
    test_endpoint "GET" "/shifts" "Get all shifts" "" "$AUTH_HEADER"
    test_endpoint "GET" "/shifts/1" "Get specific shift" "" "$AUTH_HEADER"
    
    # Test Shift Swap endpoints
    echo -e "\n${BLUE}🔄 SHIFT SWAP ENDPOINTS${NC}"
    test_endpoint "GET" "/shift-swap-requests" "Get shift swap requests" "" "$AUTH_HEADER"
    
    # Test Notifications endpoints
    echo -e "\n${BLUE}🔔 NOTIFICATION ENDPOINTS${NC}"
    test_endpoint "GET" "/notifications" "Get notifications" "" "$AUTH_HEADER"
    
    # Test Authentication endpoints
    echo -e "\n${BLUE}🔐 AUTHENTICATION ENDPOINTS${NC}"
    test_endpoint "POST" "/auth/login" "Login endpoint" "" ""
    test_endpoint "GET" "/auth/profile" "Profile endpoint" "" "$AUTH_HEADER"
    
    # Test Health/Status endpoints
    echo -e "\n${BLUE}❤️  HEALTH ENDPOINTS${NC}"
    test_endpoint "GET" "/health" "Health check" "" ""
    test_endpoint "GET" "/" "Root endpoint" "" ""
    
    echo ""
}

# Function to test specific employeeId functionality
test_employee_id_specific() {
    echo "🎯 EMPLOYEE ID SPECIFIC TESTS"
    echo "==============================="
    echo ""
    
    if [ -n "$AUTH_HEADER" ]; then
        echo "Testing employeeId field presence and format..."
        
        # Test Users API for employeeId
        echo -n "Checking users API employeeId format... "
        users_response=$(curl -s -X GET "$API_BASE/users" -H "$AUTH_HEADER" -H "Accept: application/json" 2>/dev/null)
        
        if echo "$users_response" | jq -e '.[0].employeeId' >/dev/null 2>&1; then
            employee_id=$(echo "$users_response" | jq -r '.[0].employeeId')
            if [[ $employee_id =~ ^[A-Z]{3}[0-9]{3}$ ]]; then
                echo -e "${GREEN}✅ PASS${NC} - Format: $employee_id"
                log_result "✅ PASS: EmployeeId format validation - $employee_id"
            else
                echo -e "${YELLOW}⚠️  WARN${NC} - Unexpected format: $employee_id"
                log_result "⚠️  WARN: EmployeeId format unexpected - $employee_id"
            fi
        else
            echo -e "${RED}❌ FAIL${NC} - EmployeeId field missing"
            log_result "❌ FAIL: EmployeeId field missing in users API"
        fi
        
        # Test Shifts API for employeeId in user data
        echo -n "Checking shifts API user.employeeId... "
        shifts_response=$(curl -s -X GET "$API_BASE/shifts" -H "$AUTH_HEADER" -H "Accept: application/json" 2>/dev/null)
        
        if echo "$shifts_response" | jq -e '.[0].user.employeeId' >/dev/null 2>&1; then
            shift_employee_id=$(echo "$shifts_response" | jq -r '.[0].user.employeeId')
            echo -e "${GREEN}✅ PASS${NC} - Format: $shift_employee_id"
            log_result "✅ PASS: Shifts API includes user.employeeId - $shift_employee_id"
        else
            echo -e "${RED}❌ FAIL${NC} - user.employeeId field missing in shifts"
            log_result "❌ FAIL: user.employeeId field missing in shifts API"
        fi
    else
        echo "⚠️  Skipping authenticated employeeId tests (no token)"
    fi
    
    echo ""
}

# Function to generate summary report
generate_summary() {
    echo "📊 TEST SUMMARY REPORT"
    echo "======================"
    echo ""
    
    total_tests=$(grep -c "PASS\|FAIL\|WARN" "$TEST_LOG")
    passed_tests=$(grep -c "✅ PASS" "$TEST_LOG")
    failed_tests=$(grep -c "❌ FAIL" "$TEST_LOG")
    warned_tests=$(grep -c "⚠️  WARN" "$TEST_LOG")
    
    echo "Total Tests: $total_tests"
    echo -e "Passed: ${GREEN}$passed_tests${NC}"
    echo -e "Failed: ${RED}$failed_tests${NC}"
    echo -e "Warnings: ${YELLOW}$warned_tests${NC}"
    echo ""
    
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED!${NC}"
        echo "✅ Employee ID synchronization is working correctly"
    else
        echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
        echo "❌ Review the detailed log: $TEST_LOG"
    fi
    
    echo ""
    echo "📄 Detailed log saved to: $TEST_LOG"
    echo "📅 Test completed at: $(date)"
}

# Main execution
main() {
    # Initialize log
    echo "RSUD Anugerah Endpoint Testing - $(date)" > "$TEST_LOG"
    echo "================================================" >> "$TEST_LOG"
    echo "" >> "$TEST_LOG"
    
    # Check services
    if ! check_services; then
        echo "❌ Cannot proceed with tests - required services not available"
        exit 1
    fi
    
    # Run tests
    run_endpoint_tests
    test_employee_id_specific
    
    # Generate summary
    generate_summary
}

# Execute main function
main "$@"

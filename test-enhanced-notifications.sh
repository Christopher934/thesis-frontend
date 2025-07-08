#!/bin/bash

# Enhanced User-Based Notifications Testing Script
# Tests all new notification endpoints and functionality

echo "🚀 Testing Enhanced User-Based Notifications System"
echo "=================================================="

# Configuration
API_BASE="http://localhost:3001"
AUTH_TOKEN="" # Will be set after login

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
    esac
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $AUTH_TOKEN" \
                  -H "Content-Type: application/json" \
                  "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
                  -H "Authorization: Bearer $AUTH_TOKEN" \
                  -H "Content-Type: application/json" \
                  -d "$data" \
                  "$API_BASE$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        print_status "SUCCESS" "HTTP $http_code - $description"
        echo "Response: $body" | head -c 200
        echo "..."
    else
        print_status "ERROR" "HTTP $http_code - $description failed"
        echo "Error response: $body"
    fi
}

# Function to check if backend is running
check_backend() {
    print_status "INFO" "Checking if backend is running..."
    
    response=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$API_BASE/auth/login" -o /dev/null)
    
    if [ "$response" -eq 400 ] || [ "$response" -eq 401 ] || [ "$response" -eq 200 ]; then
        print_status "SUCCESS" "Backend is running"
        return 0
    else
        print_status "ERROR" "Backend is not running or not accessible (HTTP: $response)"
        print_status "INFO" "Please start the backend with: npm run start:dev"
        return 1
    fi
}

# Function to authenticate
authenticate() {
    print_status "INFO" "Authenticating with test credentials..."
    
    # Try to login with admin credentials
    auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@rsud.id","password":"password123"}' \
        "$API_BASE/auth/login")
    
    # Extract token from response
    AUTH_TOKEN=$(echo "$auth_response" | jq -r '.access_token' 2>/dev/null)
    
    if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
        print_status "SUCCESS" "Authentication successful"
        print_status "INFO" "Token: ${AUTH_TOKEN:0:50}..."
        return 0
    else
        print_status "ERROR" "Authentication failed"
        print_status "INFO" "Response: $auth_response"
        return 1
    fi
}

# Function to test personal attendance reminder
test_personal_attendance_reminder() {
    local data='{
        "userId": 2,
        "shiftTime": "08:00",
        "location": "ICU",
        "reminderMinutes": 30
    }'
    
    test_endpoint "POST" "/api/user-notifications/personal-attendance-reminder" \
                  "$data" "Personal Attendance Reminder"
}

# Function to test personal task assignment
test_personal_task_assignment() {
    local data='{
        "userId": 2,
        "taskId": 1,
        "taskTitle": "Complete Patient Documentation",
        "description": "Complete all patient documentation for ward A",
        "dueDate": "2025-07-05T18:00:00Z",
        "priority": "HIGH",
        "assignedBy": "Dr. Smith"
    }'
    
    test_endpoint "POST" "/api/user-notifications/personal-task-assignment" \
                  "$data" "Personal Task Assignment"
}

# Function to test interactive announcement
test_interactive_announcement() {
    local data='{
        "title": "Voluntary Training Session",
        "content": "We are organizing a voluntary training session on new medical equipment. Please express your interest if you would like to participate.",
        "targetRoles": ["PERAWAT", "DOKTER"],
        "interactionType": "INTEREST",
        "deadline": "2025-07-10T17:00:00Z",
        "maxParticipants": 20
    }'
    
    test_endpoint "POST" "/api/user-notifications/interactive-announcement" \
                  "$data" "Interactive Announcement"
}

# Function to test director notification
test_director_notification() {
    local data='{
        "userId": 3,
        "title": "Urgent: Budget Review Required",
        "content": "Please review the quarterly budget report and provide your approval by end of day.",
        "priority": "URGENT",
        "actionRequired": true,
        "relatedDocumentId": 123
    }'
    
    test_endpoint "POST" "/api/user-notifications/director-notification" \
                  "$data" "Director Notification"
}

# Function to test personal meeting reminder
test_personal_meeting_reminder() {
    local data='{
        "userId": 2,
        "meetingId": 456,
        "title": "Department Meeting",
        "startTime": "2025-07-05T14:00:00Z",
        "location": "Conference Room A",
        "reminderMinutes": 15,
        "organizer": "Head of Department"
    }'
    
    test_endpoint "POST" "/api/user-notifications/personal-meeting-reminder" \
                  "$data" "Personal Meeting Reminder"
}

# Function to test personal warning
test_personal_warning() {
    local data='{
        "userId": 2,
        "warningType": "ATTENDANCE",
        "severity": "VERBAL",
        "reason": "Late arrival on multiple occasions",
        "issuedBy": "Supervisor",
        "actionRequired": "Improve punctuality",
        "deadline": "2025-07-15T23:59:59Z"
    }'
    
    test_endpoint "POST" "/api/user-notifications/personal-warning" \
                  "$data" "Personal Warning"
}

# Function to test getting user-specific notifications
test_get_user_notifications() {
    test_endpoint "GET" "/api/user-notifications/user-specific" \
                  "" "Get User-Specific Notifications"
}

# Function to test getting personal notifications
test_get_personal_notifications() {
    test_endpoint "GET" "/api/user-notifications/personal" \
                  "" "Get Personal Notifications"
}

# Function to test getting interactive notifications
test_get_interactive_notifications() {
    test_endpoint "GET" "/api/user-notifications/interactive" \
                  "" "Get Interactive Notifications"
}

# Function to test existing notification endpoints
test_existing_endpoints() {
    print_status "INFO" "Testing existing notification endpoints..."
    
    test_endpoint "GET" "/notifikasi" "" "Get All Notifications"
    test_endpoint "GET" "/notifikasi/unread-count" "" "Get Unread Count"
}

# Main execution
main() {
    echo "Starting Enhanced Notifications Test Suite"
    echo "Time: $(date)"
    echo ""
    
    # Check if backend is running
    if ! check_backend; then
        exit 1
    fi
    
    # Authenticate
    if ! authenticate; then
        exit 1
    fi
    
    echo ""
    print_status "INFO" "Starting notification endpoint tests..."
    
    # Test existing endpoints first
    test_existing_endpoints
    
    echo ""
    print_status "INFO" "Testing new user-based notification endpoints..."
    
    # Test new endpoints
    test_personal_attendance_reminder
    test_personal_task_assignment
    test_interactive_announcement
    test_director_notification
    test_personal_meeting_reminder
    test_personal_warning
    
    echo ""
    print_status "INFO" "Testing notification retrieval endpoints..."
    
    # Test retrieval endpoints
    test_get_user_notifications
    test_get_personal_notifications
    test_get_interactive_notifications
    
    echo ""
    print_status "SUCCESS" "Enhanced Notifications Test Suite Completed!"
    print_status "INFO" "Check the database and frontend to verify notifications were created"
}

# Run the main function
main "$@"

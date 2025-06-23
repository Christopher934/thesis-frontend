#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001"

echo -e "${BOLD}🧪 TESTING NOTIFICATION ISOLATION FIXES${NC}"
echo -e "${BOLD}==========================================${NC}"

# Function to login and get token
login_user() {
    local email=$1
    local password=$2
    echo -e "${BLUE}🔐 Logging in user: $email${NC}"
    
    response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo $response | jq -r '.access_token // empty')
    user_id=$(echo $response | jq -r '.user.id // empty')
    
    if [ ! -z "$token" ] && [ "$token" != "null" ]; then
        echo -e "${GREEN}✅ Login successful for $email${NC}"
        echo "$token,$user_id"
    else
        echo -e "${RED}❌ Login failed for $email${NC}"
        echo $response
        return 1
    fi
}

# Function to create test notification
create_notification() {
    local token=$1
    local user_id=$2
    local title=$3
    local message=$4
    
    echo -e "${BLUE}📝 Creating notification for user $user_id${NC}"
    
    response=$(curl -s -X POST "$API_BASE/notifikasi" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{\"userId\":$user_id,\"judul\":\"$title\",\"pesan\":\"$message\",\"jenis\":\"SISTEM_INFO\"}")
    
    notification_id=$(echo $response | jq -r '.id // empty')
    
    if [ ! -z "$notification_id" ] && [ "$notification_id" != "null" ]; then
        echo -e "${GREEN}✅ Notification created with ID: $notification_id${NC}"
        echo "$notification_id"
    else
        echo -e "${RED}❌ Failed to create notification${NC}"
        echo $response
        return 1
    fi
}

# Function to get notifications
get_notifications() {
    local token=$1
    local user_email=$2
    
    echo -e "${BLUE}📋 Getting notifications for $user_email${NC}"
    
    response=$(curl -s -X GET "$API_BASE/notifikasi" \
        -H "Authorization: Bearer $token")
    
    count=$(echo $response | jq '. | length')
    echo -e "${GREEN}✅ Retrieved $count notifications for $user_email${NC}"
    echo "$response"
}

# Function to mark notification as read
mark_as_read() {
    local token=$1
    local notification_id=$2
    local user_email=$3
    
    echo -e "${BLUE}✅ Marking notification $notification_id as read for $user_email${NC}"
    
    response=$(curl -s -w "%{http_code}" -X PUT "$API_BASE/notifikasi/$notification_id/read" \
        -H "Authorization: Bearer $token")
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Notification $notification_id marked as read by $user_email${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to mark notification as read (HTTP: $http_code)${NC}"
        echo "$response_body"
        return 1
    fi
}

# Main test
echo -e "\n${YELLOW}📝 Step 1: Logging in test users...${NC}"

# Login admin
admin_result=$(login_user "admin@example.com" "admin123")
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cannot continue - admin login failed${NC}"
    exit 1
fi
admin_token=$(echo $admin_result | cut -d',' -f1)
admin_id=$(echo $admin_result | cut -d',' -f2)

# Login perawat1
perawat1_result=$(login_user "testperawat1@example.com" "password123")
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cannot continue - testperawat1 login failed${NC}"
    exit 1
fi
perawat1_token=$(echo $perawat1_result | cut -d',' -f1)
perawat1_id=$(echo $perawat1_result | cut -d',' -f2)

# Login perawat2  
perawat2_result=$(login_user "testperawat2@example.com" "password123")
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cannot continue - testperawat2 login failed${NC}"
    exit 1
fi
perawat2_token=$(echo $perawat2_result | cut -d',' -f1)
perawat2_id=$(echo $perawat2_result | cut -d',' -f2)

echo -e "\n${YELLOW}📝 Step 2: Creating test notifications...${NC}"

# Create notifications for each user
perawat1_notification=$(create_notification "$admin_token" "$perawat1_id" "Test for Perawat1" "This is a test notification for perawat1")
perawat2_notification=$(create_notification "$admin_token" "$perawat2_id" "Test for Perawat2" "This is a test notification for perawat2")

if [ -z "$perawat1_notification" ] || [ -z "$perawat2_notification" ]; then
    echo -e "${RED}❌ Cannot continue - notification creation failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📝 Step 3: Verifying users can see their own notifications...${NC}"

perawat1_notifications=$(get_notifications "$perawat1_token" "testperawat1@example.com")
perawat2_notifications=$(get_notifications "$perawat2_token" "testperawat2@example.com")

echo -e "\n${YELLOW}📝 Step 4: Testing notification isolation...${NC}"
echo -e "${BLUE}🔒 TestPerawat1 marking their notification as read...${NC}"

# TestPerawat1 marks their notification as read
if mark_as_read "$perawat1_token" "$perawat1_notification" "testperawat1@example.com"; then
    
    echo -e "\n${YELLOW}📝 Step 5: Verifying TestPerawat1 notification is marked as read...${NC}"
    perawat1_notifications_after=$(get_notifications "$perawat1_token" "testperawat1@example.com")
    perawat1_status=$(echo $perawat1_notifications_after | jq -r ".[] | select(.id == $perawat1_notification) | .status")
    
    if [ "$perawat1_status" = "READ" ]; then
        echo -e "${GREEN}✅ TestPerawat1's notification is correctly marked as READ${NC}"
    else
        echo -e "${RED}❌ TestPerawat1's notification is NOT marked as read (status: $perawat1_status)${NC}"
    fi
    
    echo -e "\n${YELLOW}📝 Step 6: Verifying TestPerawat2 notification remains UNREAD (isolation test)...${NC}"
    perawat2_notifications_after=$(get_notifications "$perawat2_token" "testperawat2@example.com")
    perawat2_status=$(echo $perawat2_notifications_after | jq -r ".[] | select(.id == $perawat2_notification) | .status")
    
    if [ "$perawat2_status" = "UNREAD" ]; then
        echo -e "${GREEN}✅ ISOLATION SUCCESS: TestPerawat2's notification remains UNREAD${NC}"
        echo -e "${GREEN}✅ Fix confirmed: Users can only mark their own notifications as read${NC}"
    else
        echo -e "${RED}❌ ISOLATION FAILED: TestPerawat2's notification status: $perawat2_status${NC}"
        echo -e "${RED}❌ Bug still exists: Other user's notification was affected${NC}"
    fi
    
    echo -e "\n${YELLOW}📝 Step 7: Testing cross-user attempt (should fail)...${NC}"
    echo -e "${BLUE}🔒 TestPerawat1 attempting to mark TestPerawat2's notification as read...${NC}"
    
    if ! mark_as_read "$perawat1_token" "$perawat2_notification" "testperawat1 (cross-user attempt)"; then
        echo -e "${GREEN}✅ SECURITY SUCCESS: TestPerawat1 cannot mark TestPerawat2's notification as read${NC}"
    else
        echo -e "${RED}❌ SECURITY FAILURE: TestPerawat1 was able to mark TestPerawat2's notification as read${NC}"
    fi
fi

echo -e "\n${BOLD}🎯 NOTIFICATION ISOLATION TEST COMPLETED${NC}"
echo -e "${BOLD}==========================================${NC}"

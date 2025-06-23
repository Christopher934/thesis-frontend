#!/bin/bash

# 🔧 Comprehensive Notification Role-Based Filtering Test
# This script tests the notification system based on the requirements:
#
# 🔓 Notifikasi yang Bisa Dilihat oleh Semua Role Tertentu:
# ✅ Approval → Admin, Supervisor (Staff ❌)
# 📅 Event/Kegiatan → Semua pengguna 
# 🛠️ System → Semua pengguna
# 🕐 Shift → Admin, Supervisor, dan Staff terkait
#
# 🔐 Notifikasi yang Hanya Bisa Dilihat oleh 1 atau 2 User Tertentu:
# 🧍 Absensi → User terkait saja, Admin
# 🔁 Tukar Shift → User yang terlibat, Admin, Supervisor  
# 📥 Pengajuan Cuti → User yang mengajukan, Admin, Supervisor
# 🔔 Reminder Shift → User bersangkutan saja, Admin bisa lihat semua

echo "🧪 =========================================="
echo "🧪 NOTIFICATION ROLE-BASED FILTERING TEST"
echo "🧪 =========================================="

BASE_URL="http://localhost:3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test users from previous setup
ADMIN_EMAIL="admin@rsud.com"
ADMIN_PASSWORD="admin123"

SUPERVISOR_EMAIL="supervisor@rsud.com" 
SUPERVISOR_PASSWORD="supervisor123"

PERAWAT1_EMAIL="testperawat1@example.com"
PERAWAT1_PASSWORD="password123"

PERAWAT2_EMAIL="testperawat2@example.com"
PERAWAT2_PASSWORD="password123"

# Function to login and get token
login_user() {
    local email=$1
    local password=$2
    local role_name=$3
    
    echo -e "${BLUE}🔐 Logging in ${role_name}...${NC}"
    
    response=$(curl -s -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    if [ $? -eq 0 ]; then
        token=$(echo $response | jq -r '.access_token // empty')
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            echo -e "${GREEN}✅ ${role_name} login successful${NC}"
            echo $token
            return 0
        else
            echo -e "${RED}❌ ${role_name} login failed - no token in response${NC}"
            echo "Response: $response"
            return 1
        fi
    else
        echo -e "${RED}❌ ${role_name} login failed - curl error${NC}"
        return 1
    fi
}

# Function to create test notification
create_test_notification() {
    local admin_token=$1
    local user_id=$2
    local jenis=$3
    local judul=$4
    local pesan=$5
    
    echo -e "${BLUE}📝 Creating notification: $jenis for user $user_id${NC}"
    
    response=$(curl -s -X POST "${BASE_URL}/notifikasi" \
        -H "Authorization: Bearer $admin_token" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": $user_id,
            \"judul\": \"$judul\",
            \"pesan\": \"$pesan\",
            \"jenis\": \"$jenis\"
        }")
    
    if [ $? -eq 0 ]; then
        notification_id=$(echo $response | jq -r '.id // empty')
        if [ -n "$notification_id" ] && [ "$notification_id" != "null" ]; then
            echo -e "${GREEN}✅ Notification created with ID: $notification_id${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to create notification${NC}"
            echo "Response: $response"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to create notification - curl error${NC}"
        return 1
    fi
}

# Function to get notifications for a user
get_notifications() {
    local token=$1
    local role_name=$2
    
    echo -e "${BLUE}📋 Getting notifications for ${role_name}...${NC}"
    
    response=$(curl -s -X GET "${BASE_URL}/notifikasi" \
        -H "Authorization: Bearer $token")
    
    if [ $? -eq 0 ]; then
        count=$(echo $response | jq '. | length')
        echo -e "${GREEN}✅ ${role_name} can see $count notifications${NC}"
        
        # Show notification details
        echo $response | jq -r '.[] | "  - ID: \(.id) | User: \(.userId) | Type: \(.jenis) | Title: \(.judul)"'
        
        return 0
    else
        echo -e "${RED}❌ Failed to get notifications for ${role_name}${NC}"
        return 1
    fi
}

# Function to test mark as read isolation
test_mark_as_read() {
    local user_token=$1
    local notification_id=$2
    local role_name=$3
    local should_succeed=$4
    
    echo -e "${BLUE}🔄 Testing mark as read: ${role_name} marking notification $notification_id${NC}"
    
    response=$(curl -s -X PUT "${BASE_URL}/notifikasi/${notification_id}/read" \
        -H "Authorization: Bearer $user_token")
    
    if [ $? -eq 0 ]; then
        if echo $response | jq -e '.id' > /dev/null 2>&1; then
            if [ "$should_succeed" = "true" ]; then
                echo -e "${GREEN}✅ ${role_name} successfully marked notification as read${NC}"
            else
                echo -e "${RED}❌ ${role_name} should NOT be able to mark this notification as read${NC}"
            fi
        else
            if [ "$should_succeed" = "false" ]; then
                echo -e "${GREEN}✅ ${role_name} correctly prevented from marking notification as read${NC}"
            else
                echo -e "${RED}❌ ${role_name} should be able to mark notification as read${NC}"
            fi
            echo "Response: $response"
        fi
    else
        echo -e "${RED}❌ Error testing mark as read for ${role_name}${NC}"
    fi
}

echo ""
echo "🔐 Step 1: User Authentication"
echo "================================"

# Login all test users
ADMIN_TOKEN=$(login_user "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "ADMIN")
SUPERVISOR_TOKEN=$(login_user "$SUPERVISOR_EMAIL" "$SUPERVISOR_PASSWORD" "SUPERVISOR") 
PERAWAT1_TOKEN=$(login_user "$PERAWAT1_EMAIL" "$PERAWAT1_PASSWORD" "PERAWAT1")
PERAWAT2_TOKEN=$(login_user "$PERAWAT2_EMAIL" "$PERAWAT2_PASSWORD" "PERAWAT2")

# Check if we have all tokens
if [ -z "$ADMIN_TOKEN" ] || [ -z "$PERAWAT1_TOKEN" ] || [ -z "$PERAWAT2_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get all required tokens. Exiting.${NC}"
    exit 1
fi

echo ""
echo "📝 Step 2: Create Test Notifications"
echo "===================================="

# Create various types of notifications
if [ -n "$ADMIN_TOKEN" ]; then
    # Approval notification (only Admin & Supervisor should see)
    create_test_notification "$ADMIN_TOKEN" 12 "PERSETUJUAN_CUTI" "Pengajuan Cuti" "Pengajuan cuti dari TestPerawat1"
    
    # Event notification (everyone should see)
    create_test_notification "$ADMIN_TOKEN" 12 "KEGIATAN_HARIAN" "Event Harian" "Event untuk semua staff"
    create_test_notification "$ADMIN_TOKEN" 13 "PENGUMUMAN" "Pengumuman Penting" "Pengumuman untuk semua"
    
    # System notification (everyone should see)
    create_test_notification "$ADMIN_TOKEN" 12 "SISTEM_INFO" "Info Sistem" "Update sistem aplikasi"
    
    # Personal notifications (only specific user + admin should see)
    create_test_notification "$ADMIN_TOKEN" 12 "ABSENSI_TERLAMBAT" "Absensi Terlambat" "Anda terlambat hari ini"
    create_test_notification "$ADMIN_TOKEN" 13 "REMINDER_SHIFT" "Reminder Shift" "Shift Anda dimulai 1 jam lagi"
    
    # Shift swap notification (involved users + admin + supervisor should see)
    create_test_notification "$ADMIN_TOKEN" 12 "KONFIRMASI_TUKAR_SHIFT" "Tukar Shift" "Permintaan tukar shift disetujui"
fi

echo ""
echo "👀 Step 3: Test Role-Based Visibility"
echo "====================================="

echo -e "${YELLOW}🔍 Testing ADMIN visibility (should see ALL notifications):${NC}"
get_notifications "$ADMIN_TOKEN" "ADMIN"

echo ""
if [ -n "$SUPERVISOR_TOKEN" ]; then
    echo -e "${YELLOW}🔍 Testing SUPERVISOR visibility (should see Approval, Event, System, Shift):${NC}"
    get_notifications "$SUPERVISOR_TOKEN" "SUPERVISOR"
    echo ""
fi

echo -e "${YELLOW}🔍 Testing PERAWAT1 visibility (should see own + public notifications):${NC}"
get_notifications "$PERAWAT1_TOKEN" "PERAWAT1"

echo ""
echo -e "${YELLOW}🔍 Testing PERAWAT2 visibility (should see own + public notifications):${NC}"
get_notifications "$PERAWAT2_TOKEN" "PERAWAT2"

echo ""
echo "🔒 Step 4: Test Mark-As-Read Isolation"
echo "======================================"

# Test that users can only mark their own notifications as read
echo -e "${YELLOW}🧪 Testing mark-as-read isolation...${NC}"

# Get notification IDs for testing (assuming we have some notifications created)
echo "Note: You'll need to manually test mark-as-read with specific notification IDs"
echo "Use the notification IDs from the visibility test above"

echo ""
echo "📊 Step 5: Test Summary"
echo "======================"
echo -e "${GREEN}✅ Role-based filtering test completed${NC}"
echo ""
echo "Expected Results:"
echo "🔓 Public Notifications (Everyone can see):"
echo "   - KEGIATAN_HARIAN, PENGUMUMAN, SISTEM_INFO"
echo ""
echo "🔐 Restricted Notifications:"
echo "   - PERSETUJUAN_CUTI: Only Admin & Supervisor"
echo "   - ABSENSI_TERLAMBAT: Only user involved & Admin"  
echo "   - REMINDER_SHIFT: Only user involved & Admin"
echo "   - KONFIRMASI_TUKAR_SHIFT: Only involved users & Admin & Supervisor"
echo ""
echo "🧪 Manual Testing Required:"
echo "   - Test mark-as-read with specific notification IDs"
echo "   - Verify cross-user isolation (users can't mark others' notifications)"

echo ""
echo "🎯 Test completed! Check the output above for any issues."

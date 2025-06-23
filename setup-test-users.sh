#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001"

echo -e "${BOLD}🔧 SETTING UP TEST USERS FOR NOTIFICATION TESTING${NC}"
echo -e "${BOLD}=================================================${NC}"

# Function to login admin
login_admin() {
    echo -e "${BLUE}🔐 Logging in as admin...${NC}"
    
    response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}')
    
    token=$(echo $response | jq -r '.access_token // empty')
    
    if [ ! -z "$token" ] && [ "$token" != "null" ]; then
        echo -e "${GREEN}✅ Admin login successful${NC}"
        echo "$token"
    else
        echo -e "${RED}❌ Admin login failed${NC}"
        echo $response
        exit 1
    fi
}

# Function to create test user
create_test_user() {
    local token=$1
    local email=$2
    local role=$3
    local nama_depan=$4
    local nama_belakang=$5
    
    echo -e "${BLUE}👤 Creating test user: $email ($role)${NC}"
    
    response=$(curl -s -X POST "$API_BASE/users" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{
            \"username\":\"$(echo $email | cut -d'@' -f1)\",
            \"email\":\"$email\",
            \"password\":\"password123\",
            \"namaDepan\":\"$nama_depan\",
            \"namaBelakang\":\"$nama_belakang\",
            \"alamat\":\"Test Address\",
            \"noHp\":\"081234567890\",
            \"jenisKelamin\":\"L\",
            \"tanggalLahir\":\"1990-01-01\",
            \"role\":\"$role\",
            \"status\":\"ACTIVE\"
        }")
    
    user_id=$(echo $response | jq -r '.id // empty')
    
    if [ ! -z "$user_id" ] && [ "$user_id" != "null" ]; then
        echo -e "${GREEN}✅ Test user created: $email (ID: $user_id)${NC}"
        return 0
    else
        # Check if user already exists
        if echo $response | grep -q "already exists\|unique constraint"; then
            echo -e "${YELLOW}⚠️ Test user already exists: $email${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to create test user: $email${NC}"
            echo $response
            return 1
        fi
    fi
}

# Get admin token
admin_token=$(login_admin)

echo -e "\n${YELLOW}📝 Creating test users...${NC}"

# Create perawat1
create_test_user "$admin_token" "perawat1@example.com" "PERAWAT" "Perawat" "Satu"

# Create perawat2
create_test_user "$admin_token" "perawat2@example.com" "PERAWAT" "Perawat" "Dua"

# Create staf1 for additional testing
create_test_user "$admin_token" "staf1@example.com" "STAF" "Staf" "Satu"

echo -e "\n${GREEN}✅ Test user setup completed!${NC}"
echo -e "${BOLD}Ready to run notification isolation tests${NC}"

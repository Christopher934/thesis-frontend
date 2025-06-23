#!/bin/bash

# 🧪 TEST NEW USERS AFTER SESSION CLEAR
# Script to verify all new users can login successfully

echo "🧪 ========================================"
echo "🧪 TESTING NEW USERS AFTER SESSION CLEAR"
echo "🧪 ========================================"

# Check if backend is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Backend not running on localhost:3001"
    echo "Please start backend first: cd backend && npm run start:dev"
    exit 1
fi

echo ""
echo "🔍 Testing all 7 new users from seed..."
echo ""

# Array of users to test
declare -a users=(
    "admin@rsud.id:ADMIN"
    "staff1@rsud.id:STAF" 
    "staff2@rsud.id:STAF"
    "perawat1@rsud.id:PERAWAT"
    "perawat2@rsud.id:PERAWAT"
    "supervisor1@rsud.id:SUPERVISOR"
    "supervisor2@rsud.id:SUPERVISOR"
)

successful_logins=0
total_users=${#users[@]}

for user_info in "${users[@]}"; do
    IFS=':' read -r email expected_role <<< "$user_info"
    
    echo "🔑 Testing: $email"
    
    response=$(curl -s -X POST http://localhost:3001/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"password123\"}")
    
    if echo "$response" | grep -q "access_token"; then
        actual_role=$(echo "$response" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
        username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        user_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        
        if [ "$actual_role" = "$expected_role" ]; then
            echo "   ✅ Success: $username (ID: $user_id, Role: $actual_role)"
            ((successful_logins++))
        else
            echo "   ⚠️  Login OK but role mismatch: expected $expected_role, got $actual_role"
        fi
    else
        echo "   ❌ Login failed"
        echo "   Response: $response"
    fi
    echo ""
done

echo "📊 RESULTS:"
echo "   ✅ Successful logins: $successful_logins/$total_users"

if [ $successful_logins -eq $total_users ]; then
    echo ""
    echo "🎉 ALL USERS WORKING PERFECTLY!"
    echo ""
    echo "✅ You can now:"
    echo "   1. Clear your browser localStorage"
    echo "   2. Login with any of these accounts:"
    echo ""
    for user_info in "${users[@]}"; do
        IFS=':' read -r email role <<< "$user_info"
        echo "      🔑 $email (Role: $role)"
    done
    echo ""
    echo "   Password for all: password123"
    echo ""
    echo "🚀 Ready to continue development!"
else
    echo ""
    echo "⚠️  Some users failed to login"
    echo "💡 Try running database reset again:"
    echo "   ./quick-reset-db.sh"
fi

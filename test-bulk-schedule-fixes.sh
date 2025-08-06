#!/bin/bash

echo "🧪 TESTING BULK SCHEDULE FIXES"
echo "================================"
echo ""

# Get admin token
echo "🔐 Getting admin login token..."
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"email":"admin@hospital.com","password":"admin123"}' \
    http://localhost:3001/auth/login)

if echo "$RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Admin login successful"
else
    echo "❌ Admin login failed:"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "📊 CHECKING CURRENT STATE:"
echo "========================="

# Check total shifts before test
TOTAL_SHIFTS_BEFORE=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3001/shifts" | grep -o '"id":[0-9]*' | wc -l)
echo "📅 Total shifts before test: $TOTAL_SHIFTS_BEFORE"

# Check total users
USER_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3001/users")
TOTAL_USERS=$(echo "$USER_RESPONSE" | grep -o '"id":[0-9]*' | wc -l)
echo "👥 Total users in system: $TOTAL_USERS"

# Extract user data format
echo "📋 User data sample:"
echo "$USER_RESPONSE" | head -n 5

echo ""
echo "🧪 TESTING PREVIEW ENDPOINT:"
echo "============================"

# Test preview endpoint (should NOT create shifts)
PREVIEW_REQUEST='[
    {
        "date": "2025-08-07",
        "location": "ICU",
        "shiftType": "PAGI",
        "requiredCount": 1,
        "priority": "NORMAL"
    }
]'

echo "📤 Sending preview request..."
PREVIEW_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PREVIEW_REQUEST" \
    "http://localhost:3001/admin/shift-optimization/preview-optimal-shifts")

echo "📥 Preview response:"
echo "$PREVIEW_RESPONSE" | head -n 10

# Check if shifts count increased (it shouldn't for preview)
TOTAL_SHIFTS_AFTER_PREVIEW=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3001/shifts" | grep -o '"id":[0-9]*' | wc -l)

echo ""
echo "📊 RESULTS:"
echo "==========="
echo "📅 Shifts before: $TOTAL_SHIFTS_BEFORE"
echo "📅 Shifts after preview: $TOTAL_SHIFTS_AFTER_PREVIEW"

if [ "$TOTAL_SHIFTS_BEFORE" -eq "$TOTAL_SHIFTS_AFTER_PREVIEW" ]; then
    echo "✅ PREVIEW FIX SUCCESSFUL: No shifts created during preview"
else
    echo "❌ PREVIEW FIX FAILED: Shifts were created during preview!"
    DIFF=$((TOTAL_SHIFTS_AFTER_PREVIEW - TOTAL_SHIFTS_BEFORE))
    echo "   $DIFF shifts were accidentally created"
fi

echo ""
echo "📝 FRONTEND TESTING INSTRUCTIONS:"
echo "================================="
echo "1. Open browser to http://localhost:3000"
echo "2. Login with: admin@hospital.com / admin123"
echo "3. Go to 'Manajemen Jadwal'"
echo "4. Click 'Bulk Scheduling'"
echo "5. Set up weekly schedule and click preview"
echo "6. Check if user names appear correctly in preview"
echo "7. Cancel preview and verify shift count doesn't increase"
echo ""
echo "Expected behavior:"
echo "✅ User names should appear as 'Nama Depan Nama Belakang'"
echo "✅ Preview should show employee details correctly"
echo "✅ Canceling preview should NOT create any shifts"
echo "✅ Only confirming after preview should create shifts"

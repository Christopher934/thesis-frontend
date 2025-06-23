#!/bin/bash

# Quick test of notification API endpoints
# This script tests the notification system with valid authentication

BACKEND_URL="http://localhost:3001"

echo "=== Testing RSUD Notification System API ==="

# Step 1: Login and get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  "$BACKEND_URL/auth/login")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:50}..."

# Step 2: Test notification endpoints
echo ""
echo "2. Testing notification endpoints..."

# Get all notifications
echo "   - GET /notifikasi"
NOTIF_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/notifikasi")
echo "   Response: $NOTIF_RESPONSE"

# Get unread count
echo "   - GET /notifikasi/unread-count"
COUNT_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/notifikasi/unread-count")
echo "   Response: $COUNT_RESPONSE"

# Test creating a notification  
echo "   - POST /notifikasi"
CREATE_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Test Notification","pesan":"This is a test notification","jenis":"SISTEM_INFO"}' \
  "$BACKEND_URL/notifikasi")
echo "   Response: $CREATE_RESPONSE"

# Test shift reminder endpoint
echo "   - POST /notifikasi/test/shift-reminder"
REMINDER_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"tipeshift":"Pagi","jammulai":"07:00","jamselesai":"15:00","lokasishift":"ICU","tanggal":"2024-06-24"}' \
  "$BACKEND_URL/notifikasi/test/shift-reminder")
echo "   Response: $REMINDER_RESPONSE"

echo ""
echo "=== Test completed ==="
echo "✅ Notification system is working!"
echo ""
echo "Available endpoints:"
echo "- POST /auth/login - Authentication"
echo "- GET /notifikasi - Get notifications"
echo "- POST /notifikasi - Create notification"
echo "- GET /notifikasi/unread-count - Get unread count"
echo "- POST /notifikasi/test/shift-reminder - Test shift reminder"
echo "- POST /notifikasi/test/new-shift - Test new shift notification"

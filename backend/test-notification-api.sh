#!/bin/bash

# Test script for Notification System API endpoints
# Make sure the backend server is running before executing this script

BASE_URL="http://localhost:3001"
TOKEN="your-jwt-token-here"  # Replace with actual JWT token

echo "🧪 Testing Notification System API Endpoints..."
echo "================================================"

# Test 1: Get notifications
echo "📝 Test 1: Get user notifications"
curl -X GET "${BASE_URL}/notifikasi" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  | jq '.' || echo "❌ Failed to get notifications"

echo -e "\n"

# Test 2: Get unread count
echo "📊 Test 2: Get unread notification count"
curl -X GET "${BASE_URL}/notifikasi/unread-count" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  | jq '.' || echo "❌ Failed to get unread count"

echo -e "\n"

# Test 3: Create test shift reminder notification
echo "⏰ Test 3: Create shift reminder notification"
curl -X POST "${BASE_URL}/notifikasi/test/shift-reminder" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' \
  | jq '.' || echo "❌ Failed to create shift reminder"

echo -e "\n"

# Test 4: Create test new shift notification
echo "🆕 Test 4: Create new shift notification"
curl -X POST "${BASE_URL}/notifikasi/test/new-shift" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' \
  | jq '.' || echo "❌ Failed to create new shift notification"

echo -e "\n"

# Test 5: Create manual notification
echo "📢 Test 5: Create manual notification"
curl -X POST "${BASE_URL}/notifikasi" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "judul": "Test Notification",
    "pesan": "This is a test notification created via API",
    "jenis": "SISTEM_INFO"
  }' \
  | jq '.' || echo "❌ Failed to create manual notification"

echo -e "\n"
echo "✅ Notification API testing completed!"
echo "💡 Remember to:"
echo "   1. Replace TOKEN with actual JWT token"
echo "   2. Ensure backend server is running"
echo "   3. Check if user with ID 1 exists in database"

#!/bin/bash

echo "🗑️ Clearing all notifications..."

API_URL="http://localhost:3001"

# Function to login and get admin token
login_admin() {
  echo "🔐 Getting admin token..."
  curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@example.com",
      "password": "admin123"
    }' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

# Check if backend is running
echo "🔗 Checking backend connection..."
if ! curl -s -X GET "$API_URL/" > /dev/null 2>&1; then
  echo "❌ Backend is not running on $API_URL"
  echo "Please start the backend first with: cd backend && npm run start:dev"
  exit 1
fi

echo "✅ Backend is running"

# Get admin token
ADMIN_TOKEN=$(login_admin)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

echo "✅ Admin token obtained"

# Get all notifications
echo "📋 Fetching all notifications..."
NOTIFICATIONS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/notifikasi")

# Extract notification IDs
NOTIFICATION_IDS=$(echo "$NOTIFICATIONS" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$NOTIFICATION_IDS" ]; then
  echo "ℹ️ No notifications found to delete"
  exit 0
fi

echo "🗑️ Found notifications to delete..."
echo "$NOTIFICATION_IDS"

# Delete each notification
for id in $NOTIFICATION_IDS; do
  echo "Deleting notification ID: $id"
  curl -s -X DELETE "$API_URL/notifikasi/$id" \
    -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
done

echo ""
echo "✅ All notifications have been cleared!"
echo ""

# Verify deletion
REMAINING_COUNT=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/notifikasi" | grep -o '"id":' | wc -l)
echo "📊 Remaining notifications: $REMAINING_COUNT"

if [ "$REMAINING_COUNT" -eq 0 ]; then
  echo "🎉 Database is now clean - no notifications remaining!"
else
  echo "⚠️ Some notifications may still remain"
fi

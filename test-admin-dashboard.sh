#!/bin/bash
# Test script untuk login dan test admin dashboard

echo "🔐 Testing login and admin dashboard..."

# Step 1: Login and get token
echo "📝 Step 1: Login to get token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rsud.id", "password": "password123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from login"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."

# Step 2: Test backend dashboard directly
echo "📊 Step 2: Testing backend dashboard..."
BACKEND_RESPONSE=$(curl -s -X GET http://localhost:3001/admin/shift-optimization/dashboard \
  -H "Authorization: Bearer $TOKEN")

echo "Backend dashboard response length: $(echo $BACKEND_RESPONSE | wc -c)"

# Step 3: Test frontend API with cookie
echo "🌐 Step 3: Testing frontend API with cookie..."
FRONTEND_RESPONSE=$(curl -s -X GET http://localhost:3000/api/admin/dashboard \
  -H "Cookie: token=$TOKEN")

echo "Frontend API response: $FRONTEND_RESPONSE"

echo "✅ Test completed!"

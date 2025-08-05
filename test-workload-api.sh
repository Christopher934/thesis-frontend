#!/bin/bash

# Test script for workload monitoring API endpoints
# Run this after starting the backend server

BASE_URL="http://localhost:3001"
# Get auth token first (adjust credentials as needed)
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.access_token' 2>/dev/null)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token. Please check credentials or backend status."
  exit 1
fi

echo "✅ Got auth token: ${TOKEN:0:20}..."

# Test workload monitoring endpoint
echo ""
echo "🔍 Testing workload monitoring endpoint..."
curl -s -X GET "$BASE_URL/laporan/workload" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.[0:2]' || echo "❌ Workload endpoint failed"

# Test capacity monitoring endpoint  
echo ""
echo "🔍 Testing capacity monitoring endpoint..."
curl -s -X GET "$BASE_URL/laporan/capacity" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.[0:2]' || echo "❌ Capacity endpoint failed"

# Test capacity check endpoint
echo ""
echo "🔍 Testing capacity check endpoint..."
curl -s -X GET "$BASE_URL/laporan/capacity/check?userId=1&location=ICU&date=2025-01-20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ Capacity check endpoint failed"

# Test individual user workload
echo ""
echo "🔍 Testing individual user workload endpoint..."
curl -s -X GET "$BASE_URL/laporan/workload/user/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ User workload endpoint failed"

echo ""
echo "✅ API testing completed!"

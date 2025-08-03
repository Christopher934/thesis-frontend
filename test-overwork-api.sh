#!/bin/bash

echo "🚀 Testing Overwork Request System API..."

# Test eligibility check endpoint
echo "📋 Testing eligibility check for user ID 1..."
curl -X GET "http://localhost:3001/overwork/eligibility/1" \
  -H "Content-Type: application/json" \
  2>/dev/null | jq '.' || echo "Failed to test eligibility endpoint"

echo ""

# Test workload summary endpoint  
echo "📊 Testing workload summary for user ID 1..."
curl -X GET "http://localhost:3001/overwork/workload-summary/1" \
  -H "Content-Type: application/json" \
  2>/dev/null | jq '.' || echo "Failed to test workload summary endpoint"

echo ""

# Test creating an overwork request
echo "💼 Testing overwork request creation..."
curl -X POST "http://localhost:3001/overwork/request" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "additionalHours": 20,
    "duration": "temporary",
    "reason": "Emergency project deadline",
    "validUntil": "2024-12-31"
  }' \
  2>/dev/null | jq '.' || echo "Failed to test request creation endpoint"

echo ""

# Test getting pending requests (admin function)
echo "📋 Testing pending requests retrieval..."
curl -X GET "http://localhost:3001/overwork/requests/pending" \
  -H "Content-Type: application/json" \
  2>/dev/null | jq '.' || echo "Failed to test pending requests endpoint"

echo ""
echo "✅ API endpoint tests completed!"
echo "Note: Make sure backend server is running on port 3001"

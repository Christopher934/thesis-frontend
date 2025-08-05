#!/bin/bash

echo "Testing workload-analysis endpoint..."

# Test without authentication first
echo "1. Testing without auth (should get 401):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/laporan/workload-analysis
echo ""

# Test if endpoint exists (should not get 404)
echo "2. Testing endpoint existence:"
response=$(curl -s -w "%{http_code}" http://localhost:3001/laporan/workload-analysis 2>/dev/null)
status_code="${response: -3}"

if [ "$status_code" = "404" ]; then
    echo "❌ Endpoint still returns 404 - not found"
elif [ "$status_code" = "401" ]; then
    echo "✅ Endpoint exists but requires auth (correct behavior)"
else
    echo "🔍 Endpoint returns status: $status_code"
fi

echo ""
echo "3. Testing with potential auth token from localStorage:"

# Try to extract token from browser localStorage if available
# This is a simple test to verify endpoint works
echo "If you have a valid token, you can test manually with:"
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost:3001/laporan/workload-analysis"

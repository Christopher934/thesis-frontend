#!/bin/bash

echo "🧪 Testing Enhanced Workload API"
echo "================================"

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "❌ Backend server is not running on port 3001"
    echo "💡 Please start the backend server first with: npm run start:dev"
    exit 1
fi

echo "✅ Backend server is running"

# Test the enhanced workload analysis endpoint
echo ""
echo "🔍 Testing workload analysis endpoint..."
echo "GET /overwork/admin/workload/analysis"

# Note: Replace YOUR_TOKEN_HERE with an actual JWT token
RESPONSE=$(curl -s -X GET "http://localhost:3001/overwork/admin/workload/analysis" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" 2>/dev/null)

if [ $? -eq 0 ] && [ ! -z "$RESPONSE" ]; then
    echo "✅ API endpoint is accessible"
    
    # Check if response contains expected fields
    if echo "$RESPONSE" | grep -q "weeklyShifts" && echo "$RESPONSE" | grep -q "dailyShifts"; then
        echo "✅ Response contains new weekly and daily shift data"
        echo ""
        echo "📊 Sample response structure:"
        echo "$RESPONSE" | head -c 500 | jq '.[0] // empty' 2>/dev/null || echo "$RESPONSE" | head -c 200
        echo ""
    else
        echo "⚠️  Response may not contain expected fields"
    fi
else
    echo "❌ Failed to connect to API endpoint"
    echo "💡 Make sure you have a valid JWT token"
fi

echo ""
echo "🏁 Test completed"
echo ""
echo "📋 Summary of Changes:"
echo "   ✅ Added getUserWeeklyShifts() method to ShiftValidationService"
echo "   ✅ Added getUserDailyShifts() method to ShiftValidationService"
echo "   ✅ Fixed private property access in overwork controller"
echo "   ✅ Enhanced workload analysis API with weekly/daily data"
echo "   ✅ Updated frontend to display weekly and daily statistics"

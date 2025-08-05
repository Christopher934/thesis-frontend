#!/bin/bash

echo "🔍 Debug Monthly Schedule - Step by Step Analysis"
echo "==============================================="

# Simple test with detailed logging
echo "📋 Testing with ICU configuration: PERAWAT(2,2,0)"

PAYLOAD='{
  "year": 2025,
  "month": 8,
  "locations": ["ICU"],
  "staffPattern": {
    "ICU": {
      "PAGI": { "DOKTER": 0, "PERAWAT": 2, "STAFF": 0 },
      "SIANG": { "DOKTER": 0, "PERAWAT": 2, "STAFF": 0 },
      "MALAM": { "DOKTER": 0, "PERAWAT": 0, "STAFF": 0 }
    }
  },
  "workloadLimits": { "maxShiftsPerPerson": 18, "maxConsecutiveDays": 4 }
}'

echo "📤 Request:"
echo "$PAYLOAD" | jq .

echo ""
echo "🚀 Sending request and showing detailed response..."

curl -X POST http://localhost:3001/admin/scheduling/monthly \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\n📊 HTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "💡 Expected calculation:"
echo "   Days in August 2025: 31 days"
echo "   Working days (skip past dates from Aug 4): ~27 days"
echo "   PAGI shifts: 2 staff x 27 days = 54 shifts"
echo "   SIANG shifts: 2 staff x 27 days = 54 shifts" 
echo "   MALAM shifts: 0 staff x 27 days = 0 shifts"
echo "   TOTAL EXPECTED: ~108 shifts (not 117!)"

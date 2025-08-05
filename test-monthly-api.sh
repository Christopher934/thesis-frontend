#!/bin/bash

echo "🧪 Testing Monthly Schedule API"
echo "================================"

# Test payload
PAYLOAD='{
  "year": 2025,
  "month": 8,
  "locations": ["ICU", "GAWAT_DARURAT"],
  "staffPattern": {
    "ICU": {
      "PAGI": { "DOKTER": 2, "PERAWAT": 3, "STAFF": 1 },
      "SIANG": { "DOKTER": 1, "PERAWAT": 2, "STAFF": 1 },
      "MALAM": { "DOKTER": 1, "PERAWAT": 2, "STAFF": 0 }
    },
    "GAWAT_DARURAT": {
      "PAGI": { "DOKTER": 3, "PERAWAT": 4, "STAFF": 2 },
      "SIANG": { "DOKTER": 2, "PERAWAT": 3, "STAFF": 1 },
      "MALAM": { "DOKTER": 1, "PERAWAT": 2, "STAFF": 1 }
    }
  },
  "workloadLimits": {
    "maxShiftsPerPerson": 15,
    "maxConsecutiveDays": 4
  }
}'

echo "📋 Request payload:"
echo "$PAYLOAD" | jq .

echo ""
echo "🚀 Sending request to monthly schedule API..."

# Make the API call
curl -X POST http://localhost:3001/admin/scheduling/monthly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "$PAYLOAD" \
  -w "\n\n📊 Response Status: %{http_code}\n" \
  -s | jq .

echo "✅ Test completed"

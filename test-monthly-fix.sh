#!/bin/bash

echo "🧪 Testing Monthly Schedule with Different Configurations"
echo "========================================================"

# Test 1: ICU dengan konfigurasi minimal (seperti di screenshot)
echo "🏥 Test 1: ICU - PERAWAT(2,2,0)"
PAYLOAD1='{
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

curl -X POST http://localhost:3001/admin/scheduling/monthly \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD1" -s | jq '{totalShifts: .totalShifts, successfulAssignments: .successfulAssignments, createdShifts: .createdShifts}'

echo ""
echo "🏥 Test 2: RAWAT_JALAN - PERAWAT(1,0,0)"
PAYLOAD2='{
  "year": 2025,
  "month": 8,
  "locations": ["RAWAT_JALAN"],
  "staffPattern": {
    "RAWAT_JALAN": {
      "PAGI": { "DOKTER": 0, "PERAWAT": 1, "STAFF": 0 },
      "SIANG": { "DOKTER": 0, "PERAWAT": 0, "STAFF": 0 },
      "MALAM": { "DOKTER": 0, "PERAWAT": 0, "STAFF": 0 }
    }
  },
  "workloadLimits": { "maxShiftsPerPerson": 18, "maxConsecutiveDays": 4 }
}'

curl -X POST http://localhost:3001/admin/scheduling/monthly \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD2" -s | jq '{totalShifts: .totalShifts, successfulAssignments: .successfulAssignments, createdShifts: .createdShifts}'

echo ""
echo "🏥 Test 3: FARMASI - DOKTER(2,0,0) + PERAWAT(2,2,2)"
PAYLOAD3='{
  "year": 2025,
  "month": 8,
  "locations": ["FARMASI"],
  "staffPattern": {
    "FARMASI": {
      "PAGI": { "DOKTER": 2, "PERAWAT": 2, "STAFF": 0 },
      "SIANG": { "DOKTER": 0, "PERAWAT": 2, "STAFF": 0 },
      "MALAM": { "DOKTER": 0, "PERAWAT": 2, "STAFF": 0 }
    }
  },
  "workloadLimits": { "maxShiftsPerPerson": 18, "maxConsecutiveDays": 4 }
}'

curl -X POST http://localhost:3001/admin/scheduling/monthly \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD3" -s | jq '{totalShifts: .totalShifts, successfulAssignments: .successfulAssignments, createdShifts: .createdShifts}'

echo ""
echo "📊 Expected Results:"
echo "Test 1 (ICU): Should create ~62 shifts (2 staff x 31 days, skip weekends)"
echo "Test 2 (RAWAT_JALAN): Should create ~31 shifts (1 staff x 31 days PAGI only)"
echo "Test 3 (FARMASI): Should create ~124 shifts (4 PAGI + 2 SIANG + 2 MALAM x 31 days)"
echo ""
echo "✅ If results are different for each test, the fix is working!"

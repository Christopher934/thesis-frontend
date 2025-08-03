#!/bin/bash

echo "🧪 Testing Frontend Warning Modal System"
echo "========================================"

# Test data that should trigger warnings
echo ""
echo "1. Testing shift creation with potential violations..."
curl -X POST http://localhost:3001/shift-restrictions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1,
    "date": "2024-12-28T06:00:00.000Z",
    "shiftType": "MALAM",
    "location": "ICU",
    "startTime": "20:00:00",
    "endTime": "08:00:00",
    "duration": 12,
    "requiredRole": "DOKTER"
  }' | jq .

echo ""
echo "2. Testing shift creation with good conditions..."
curl -X POST http://localhost:3001/shift-restrictions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 2,
    "date": "2024-12-30T06:00:00.000Z",
    "shiftType": "PAGI",
    "location": "RAWAT_JALAN",
    "startTime": "08:00:00",
    "endTime": "15:00:00",
    "duration": 7,
    "requiredRole": "PERAWAT"
  }' | jq .

echo ""
echo "3. Testing optimization endpoint..."
curl -X POST http://localhost:3001/shift-restrictions/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-28T06:00:00.000Z",
    "shiftType": "PAGI",
    "location": "ICU",
    "requiredSkills": ["PERAWAT"],
    "priority": "HIGH",
    "duration": 8,
    "requiredRole": "PERAWAT"
  }' | jq .

echo ""
echo "✅ Frontend warning modal test completed!"
echo "Now test by:"
echo "1. Go to http://localhost:3000"
echo "2. Login as admin"
echo "3. Try to create a shift with user ID 1 for night shift"
echo "4. Check if warning modal appears with validation results"

#!/bin/bash

echo "🚀 RSUD Anugerah - Comprehensive API Testing"
echo "=============================================="

# Get admin token
echo "🔐 Getting admin token..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3001/auth/login" \
-H "Content-Type: application/json" \
-d '{"email": "admin@example.com", "password": "admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Admin token obtained"
AUTH_HEADER="Authorization: Bearer $TOKEN"

echo ""
echo "=== 🔐 Authentication Tests ==="

echo "1. ✅ Valid Login - PASSED"

echo "2. Testing Invalid Login..."
INVALID_LOGIN=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "http://localhost:3001/auth/login" \
-H "Content-Type: application/json" \
-d '{"email": "invalid@test.com", "password": "wrong"}')

if echo "$INVALID_LOGIN" | grep -q "HTTPSTATUS:401"; then
    echo "   ✅ Invalid Login - PASSED (401 Unauthorized)"
else
    echo "   ❌ Invalid Login - FAILED"
fi

echo ""
echo "=== 👥 User Management Tests ==="

echo "3. Testing Get All Users..."
USERS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/users")
if echo "$USERS_RESPONSE" | grep -q "HTTPSTATUS:200"; then
    echo "   ✅ Get All Users - PASSED"
else
    echo "   ❌ Get All Users - FAILED"
fi

echo "4. Testing User Count by Role..."
COUNT_ROLE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/users/count-by-role")
if echo "$COUNT_ROLE" | grep -q "HTTPSTATUS:200"; then
    echo "   ✅ Count by Role - PASSED"
else
    echo "   ❌ Count by Role - FAILED"
fi

echo "5. Testing Create User..."
CREATE_USER=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "http://localhost:3001/users" \
-H "Content-Type: application/json" \
-d '{
    "username": "apitestuser",
    "email": "apitest@hospital.com",
    "password": "test123",
    "namaDepan": "API",
    "namaBelakang": "Test",
    "alamat": "Test Address",
    "noHp": "081234567890",
    "jenisKelamin": "L",
    "tanggalLahir": "1990-01-01",
    "role": "PERAWAT"
}')

if echo "$CREATE_USER" | grep -q "HTTPSTATUS:201"; then
    echo "   ✅ Create User - PASSED"
    USER_ID=$(echo "$CREATE_USER" | sed 's/HTTPSTATUS.*//' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "   📝 Created User ID: $USER_ID"
else
    echo "   ❌ Create User - FAILED"
    echo "   Response: $(echo "$CREATE_USER" | sed 's/HTTPSTATUS.*//')"
fi

echo ""
echo "=== 📝 Notification Tests ==="

echo "6. Testing Get Notifications..."
GET_NOTIF=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/notifikasi" -H "$AUTH_HEADER")
if echo "$GET_NOTIF" | grep -q "HTTPSTATUS:200"; then
    echo "   ✅ Get Notifications - PASSED"
else
    echo "   ❌ Get Notifications - FAILED"
fi

echo "7. Testing Create Notification..."
CREATE_NOTIF=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "http://localhost:3001/notifikasi" \
-H "Content-Type: application/json" \
-H "$AUTH_HEADER" \
-d '{
    "userId": 2,
    "judul": "API Test Notification",
    "pesan": "This is a test notification created via comprehensive API testing",
    "jenis": "SISTEM_INFO"
}')

if echo "$CREATE_NOTIF" | grep -q "HTTPSTATUS:201"; then
    echo "   ✅ Create Notification - PASSED"
    NOTIF_ID=$(echo "$CREATE_NOTIF" | sed 's/HTTPSTATUS.*//' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "   📝 Created Notification ID: $NOTIF_ID"
else
    echo "   ❌ Create Notification - FAILED"
fi

echo ""
echo "=== 🕐 Shift Management Tests ==="

echo "8. Testing Get Shifts..."
GET_SHIFTS=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/shifts" -H "$AUTH_HEADER")
if echo "$GET_SHIFTS" | grep -q "HTTPSTATUS:200"; then
    echo "   ✅ Get Shifts - PASSED"
else
    echo "   ❌ Get Shifts - FAILED"
fi

echo "9. Testing Create Shift..."
CREATE_SHIFT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "http://localhost:3001/shifts" \
-H "Content-Type: application/json" \
-H "$AUTH_HEADER" \
-d '{
    "tanggal": "2025-06-25",
    "jammulai": "08:00",
    "jamselesai": "16:00",
    "lokasishift": "RAWAT_JALAN",
    "idpegawai": "apitestuser"
}')

if echo "$CREATE_SHIFT" | grep -q "HTTPSTATUS:201"; then
    echo "   ✅ Create Shift - PASSED"
    SHIFT_ID=$(echo "$CREATE_SHIFT" | sed 's/HTTPSTATUS.*//' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "   📝 Created Shift ID: $SHIFT_ID"
else
    echo "   ❌ Create Shift - FAILED"
    echo "   Response: $(echo "$CREATE_SHIFT" | sed 's/HTTPSTATUS.*//')"
fi

echo ""
echo "=== 📅 Event Management Tests ==="

echo "10. Testing Get Events..."
GET_EVENTS=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/events")
if echo "$GET_EVENTS" | grep -q "HTTPSTATUS:200"; then
    echo "    ✅ Get Events - PASSED"
else
    echo "    ❌ Get Events - FAILED"
fi

echo "11. Testing Create Event..."
CREATE_EVENT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "http://localhost:3001/events" \
-H "Content-Type: application/json" \
-d '{
    "nama": "API Test Event",
    "deskripsi": "Event created via comprehensive API testing",
    "tanggalMulai": "2025-06-25T10:00:00.000Z",
    "tanggalSelesai": "2025-06-25T12:00:00.000Z",
    "lokasi": "Ruang Meeting",
    "targetPeserta": ["ADMIN", "SUPERVISOR"]
}')

if echo "$CREATE_EVENT" | grep -q "HTTPSTATUS:201"; then
    echo "    ✅ Create Event - PASSED"
    EVENT_ID=$(echo "$CREATE_EVENT" | sed 's/HTTPSTATUS.*//' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "    📝 Created Event ID: $EVENT_ID"
else
    echo "    ❌ Create Event - FAILED"
    echo "    Response: $(echo "$CREATE_EVENT" | sed 's/HTTPSTATUS.*//')"
fi

echo ""
echo "=== ⏰ Attendance Tests ==="

echo "12. Testing Attendance Dashboard Stats..."
GET_STATS=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/absensi/dashboard-stats" -H "$AUTH_HEADER")
if echo "$GET_STATS" | grep -q "HTTPSTATUS:200"; then
    echo "    ✅ Attendance Dashboard Stats - PASSED"
else
    echo "    ❌ Attendance Dashboard Stats - FAILED"
fi

echo ""
echo "=== 🔄 Shift Swap Request Tests ==="

echo "13. Testing Get Shift Swap Requests..."
GET_SWAPS=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3001/shift-swap-requests")
if echo "$GET_SWAPS" | grep -q "HTTPSTATUS:200"; then
    echo "    ✅ Get Shift Swap Requests - PASSED"
else
    echo "    ❌ Get Shift Swap Requests - FAILED"
fi

echo ""
echo "=== 🧹 Update & Delete Tests ==="

# Test updates and deletes if we have IDs
if [ -n "$NOTIF_ID" ]; then
    echo "14. Testing Mark Notification as Read..."
    MARK_READ=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT "http://localhost:3001/notifikasi/$NOTIF_ID/read" -H "$AUTH_HEADER")
    if echo "$MARK_READ" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Mark as Read - PASSED"
    else
        echo "    ❌ Mark as Read - FAILED"
    fi
fi

if [ -n "$SHIFT_ID" ]; then
    echo "15. Testing Update Shift..."
    UPDATE_SHIFT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PATCH "http://localhost:3001/shifts/$SHIFT_ID" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{"jammulai": "09:00", "jamselesai": "17:00"}')
    if echo "$UPDATE_SHIFT" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Update Shift - PASSED"
    else
        echo "    ❌ Update Shift - FAILED"
    fi
fi

if [ -n "$USER_ID" ]; then
    echo "16. Testing Update User..."
    UPDATE_USER=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT "http://localhost:3001/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -d '{"namaDepan": "Updated API", "namaBelakang": "Updated Test"}')
    if echo "$UPDATE_USER" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Update User - PASSED"
    else
        echo "    ❌ Update User - FAILED"
    fi
fi

echo ""
echo "=== 🗑️ Cleanup Tests ==="

# Cleanup created test data
if [ -n "$NOTIF_ID" ]; then
    echo "17. Testing Delete Notification..."
    DELETE_NOTIF=$(curl -s -w "HTTPSTATUS:%{http_code}" -X DELETE "http://localhost:3001/notifikasi/$NOTIF_ID" -H "$AUTH_HEADER")
    if echo "$DELETE_NOTIF" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Delete Notification - PASSED"
    else
        echo "    ❌ Delete Notification - FAILED"
    fi
fi

if [ -n "$EVENT_ID" ]; then
    echo "18. Testing Delete Event..."
    DELETE_EVENT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X DELETE "http://localhost:3001/events/$EVENT_ID")
    if echo "$DELETE_EVENT" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Delete Event - PASSED"
    else
        echo "    ❌ Delete Event - FAILED"
    fi
fi

if [ -n "$SHIFT_ID" ]; then
    echo "19. Testing Delete Shift..."
    DELETE_SHIFT=$(curl -s -w "HTTPSTATUS:%{http_code}" -X DELETE "http://localhost:3001/shifts/$SHIFT_ID" -H "$AUTH_HEADER")
    if echo "$DELETE_SHIFT" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Delete Shift - PASSED"
    else
        echo "    ❌ Delete Shift - FAILED"
    fi
fi

if [ -n "$USER_ID" ]; then
    echo "20. Testing Delete User..."
    DELETE_USER=$(curl -s -w "HTTPSTATUS:%{http_code}" -X DELETE "http://localhost:3001/users/$USER_ID")
    if echo "$DELETE_USER" | grep -q "HTTPSTATUS:200"; then
        echo "    ✅ Delete User - PASSED"
    else
        echo "    ❌ Delete User - FAILED"
    fi
fi

echo ""
echo "🎯 API Testing Complete!"
echo "=============================================="

#!/bin/bash
# Manual API Testing Script for Enhanced Notifications
# File: manual-api-test.sh

echo "🔍 MANUAL API TESTING - Enhanced User-Based Notifications"
echo "========================================================"

# Configuration
API_BASE="http://localhost:3001"
ADMIN_EMAIL="admin@rsud.id"
ADMIN_PASSWORD="password123"

# Test 1: Start backend and verify
echo -e "\n1️⃣ Starting Backend and Basic Health Check"
echo "-------------------------------------------"

# Kill any existing backend processes
echo "🛑 Stopping existing backend processes..."
pkill -f "nest start" 2>/dev/null
pkill -f "npm run start:dev" 2>/dev/null
sleep 2

# Start backend in background
echo "🚀 Starting backend..."
cd /Users/jo/Documents/Backup_2/Thesis/backend
nohup npm run start:dev > /tmp/backend_manual.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:3001/auth/login -X POST -H "Content-Type: application/json" -d '{}' >/dev/null 2>&1; then
        echo "✅ Backend is responding after ${i} seconds"
        break
    fi
    sleep 1
done

# Test 2: Authentication
echo -e "\n2️⃣ Authentication Test"
echo "----------------------"

echo "📧 Testing login with: $ADMIN_EMAIL"
AUTH_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    "$API_BASE/auth/login")

echo "Response: $AUTH_RESPONSE"

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Authentication successful"
    echo "🔑 Token: ${TOKEN:0:50}..."
else
    echo "❌ Authentication failed"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

# Test 3: List available endpoints
echo -e "\n3️⃣ Testing Available Endpoints"
echo "------------------------------"

echo "📋 Testing standard notification endpoints..."

# Get all notifications
echo -n "GET /notifikasi: "
RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/notifikasi" -o /tmp/notif_response.json)
echo "HTTP $RESPONSE"
if [ "$RESPONSE" = "200" ]; then
    COUNT=$(jq length /tmp/notif_response.json 2>/dev/null || echo "0")
    echo "  📊 Found $COUNT notifications"
fi

# Get unread count
echo -n "GET /notifikasi/unread-count: "
RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/notifikasi/unread-count" -o /tmp/unread_response.json)
echo "HTTP $RESPONSE"
if [ "$RESPONSE" = "200" ]; then
    UNREAD=$(jq -r '.unreadCount' /tmp/unread_response.json 2>/dev/null || echo "0")
    echo "  📬 Unread count: $UNREAD"
fi

# Test 4: Check user-notifications endpoints
echo -e "\n4️⃣ Testing Enhanced User-Based Notification Endpoints"
echo "----------------------------------------------------"

# Test each enhanced endpoint
ENHANCED_ENDPOINTS=(
    "personal-attendance-reminder"
    "personal-task-assignment" 
    "personal-evaluation-results"
    "personal-shift-swap-confirmation"
    "interactive-announcement"
    "director-notification"
    "personal-meeting-reminder"
    "personal-warning"
)

echo "🔍 Testing endpoint availability..."

for endpoint in "${ENHANCED_ENDPOINTS[@]}"; do
    echo -n "POST /api/user-notifications/$endpoint: "
    
    # Send minimal test data
    TEST_DATA='{"userId":2,"message":"Test notification"}'
    RESPONSE=$(curl -s -w "%{http_code}" -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$TEST_DATA" \
        "$API_BASE/api/user-notifications/$endpoint" \
        -o /tmp/response_$endpoint.json)
    
    echo "HTTP $RESPONSE"
    
    if [ "$RESPONSE" = "404" ]; then
        echo "  ❌ Endpoint not found"
    elif [ "$RESPONSE" = "400" ]; then
        echo "  ⚠️  Endpoint exists but validation failed (expected)"
        ERROR_MSG=$(jq -r '.message' /tmp/response_$endpoint.json 2>/dev/null || echo "No error message")
        echo "     Error: $ERROR_MSG"
    elif [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
        echo "  ✅ Endpoint working"
    else
        echo "  ❓ Unexpected response code"
    fi
done

# Test 5: Check GET endpoints for user notifications
echo -e "\n5️⃣ Testing Enhanced Notification Retrieval Endpoints"
echo "---------------------------------------------------"

GET_ENDPOINTS=(
    "user-specific"
    "personal" 
    "interactive"
    "by-priority?priority=HIGH"
)

for endpoint in "${GET_ENDPOINTS[@]}"; do
    echo -n "GET /api/user-notifications/$endpoint: "
    
    RESPONSE=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_BASE/api/user-notifications/$endpoint" \
        -o /tmp/get_response_$(echo $endpoint | tr '?' '_').json)
    
    echo "HTTP $RESPONSE"
    
    if [ "$RESPONSE" = "404" ]; then
        echo "  ❌ Endpoint not found"
    elif [ "$RESPONSE" = "200" ]; then
        echo "  ✅ Endpoint working"
        COUNT=$(jq length /tmp/get_response_$(echo $endpoint | tr '?' '_').json 2>/dev/null || echo "N/A")
        if [ "$COUNT" != "N/A" ]; then
            echo "     📊 Returned $COUNT items"
        fi
    else
        echo "  ❓ Unexpected response: HTTP $RESPONSE"
    fi
done

# Test 6: Test actual notification creation
echo -e "\n6️⃣ Testing Actual Notification Creation"
echo "--------------------------------------"

echo "🔔 Creating test personal task assignment..."

TASK_DATA='{
    "userId": 4,
    "taskTitle": "Manual Test Task",
    "taskDescription": "This is a test task created via manual API testing",
    "priority": "HIGH",
    "deadline": "2025-07-05T16:00:00Z",
    "assignedBy": "System Administrator"
}'

RESPONSE=$(curl -s -w "%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$TASK_DATA" \
    "$API_BASE/api/user-notifications/personal-task-assignment" \
    -o /tmp/task_creation_response.json)

echo "Response: HTTP $RESPONSE"

if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
    echo "✅ Task notification created successfully"
    NOTIF_ID=$(jq -r '.id' /tmp/task_creation_response.json 2>/dev/null)
    echo "📝 Notification ID: $NOTIF_ID"
elif [ "$RESPONSE" = "404" ]; then
    echo "❌ Endpoint not found - Enhanced notifications may not be deployed"
else
    echo "⚠️  Creation failed with HTTP $RESPONSE"
    cat /tmp/task_creation_response.json
fi

# Test 7: Database verification
echo -e "\n7️⃣ Database Verification"
echo "------------------------"

echo "🗄️  Checking notifications in database..."
cd /Users/jo/Documents/Backup_2/Thesis/backend

DB_RESULT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    const notifications = await prisma.notifikasi.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { employeeId: true, namaDepan: true, role: true }
        }
      }
    });
    
    console.log('Recent notifications:');
    notifications.forEach(notif => {
      console.log(\`- \${notif.id}: \${notif.jenis} to \${notif.user.employeeId} (\${notif.user.namaDepan})\`);
    });
    
    const enhancedTypes = await prisma.notifikasi.groupBy({
      by: ['jenis'],
      _count: { jenis: true },
      where: {
        jenis: {
          in: ['PERSONAL_REMINDER_ABSENSI', 'TUGAS_PERSONAL', 'HASIL_EVALUASI_PERSONAL', 'KONFIRMASI_SHIFT_SWAP_PERSONAL', 'PENGUMUMAN_INTERAKTIF', 'NOTIFIKASI_DIREKTUR', 'REMINDER_MEETING_PERSONAL', 'PERINGATAN_PERSONAL']
        }
      }
    });
    
    console.log('\\nEnhanced notification types count:');
    enhancedTypes.forEach(type => {
      console.log(\`- \${type.jenis}: \${type._count.jenis}\`);
    });
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

checkNotifications();
" 2>/dev/null)

echo "$DB_RESULT"

# Test 8: Route debugging
echo -e "\n8️⃣ Route Debugging"
echo "------------------"

echo "🔍 Checking if UserNotificationsController is loaded..."

cd /Users/jo/Documents/Backup_2/Thesis/backend
if [ -f "src/notifikasi/user-notifications.controller.ts" ]; then
    echo "✅ UserNotificationsController file exists"
    
    # Check route prefix
    ROUTE_PREFIX=$(grep -n "@Controller" src/notifikasi/user-notifications.controller.ts | head -1)
    echo "📍 Route prefix: $ROUTE_PREFIX"
    
    # Check method count
    METHOD_COUNT=$(grep -c "@Post\|@Get\|@Put\|@Delete" src/notifikasi/user-notifications.controller.ts)
    echo "📊 Total endpoints: $METHOD_COUNT"
    
else
    echo "❌ UserNotificationsController file not found"
fi

# Check module registration
if grep -q "UserNotificationsController" src/notifikasi/notifikasi.module.ts; then
    echo "✅ UserNotificationsController is registered in module"
else
    echo "❌ UserNotificationsController not found in module"
fi

# Summary
echo -e "\n📋 SUMMARY"
echo "=========="

echo "🔧 Backend Status: $(ps aux | grep -c 'nest start' | grep -v grep || echo '0') processes running"
echo "🔑 Authentication: $([ -n "$TOKEN" ] && echo "✅ Working" || echo "❌ Failed")"
echo "📡 API Base: $API_BASE"
echo "👤 Test User: $ADMIN_EMAIL"

# Cleanup
echo -e "\n🧹 Cleanup"
echo "----------"
echo "Backend process (PID $BACKEND_PID) left running for continued testing"
echo "To stop: kill $BACKEND_PID"
echo "Log file: /tmp/backend_manual.log"

echo -e "\n✅ Manual API testing completed!"
echo "Check the detailed output above for specific endpoint status."

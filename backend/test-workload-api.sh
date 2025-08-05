#!/bin/bash

echo "🚀 Starting workload analysis test..."

# Start backend if not running
echo "📡 Starting backend server..."
npm run start:dev &
BACKEND_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Test the workload endpoint
echo "🔍 Testing workload analysis endpoint..."
curl -X GET "http://localhost:3001/overwork/admin/workload/analysis" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" | jq '.[0]' || echo "❌ Failed to fetch workload data"

echo "✅ Test completed!"

# Stop backend
kill $BACKEND_PID 2>/dev/null || true

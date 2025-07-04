#!/bin/bash

echo "🏥 RSUD ANUGERAH - ENDPOINT TESTING"
echo "===================================="
echo "Date: $(date)"
echo ""

API_BASE="http://localhost:3001"

# Test basic connectivity
echo "🔍 Testing API Connectivity..."
echo -n "Backend Health Check: "
if curl -s "$API_BASE" >/dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend not accessible"
    exit 1
fi

echo ""
echo "📋 Testing Core Endpoints..."

# Test 1: Users endpoint (public)
echo -n "1. GET /users (public): "
response=$(curl -s "$API_BASE/users" 2>/dev/null)
if echo "$response" | grep -q "Unauthorized\|error"; then
    echo "🔒 Requires authentication"
else
    echo "✅ Accessible"
fi

# Test 2: Root endpoint
echo -n "2. GET / (root): "
response=$(curl -s "$API_BASE/" 2>/dev/null)
if [ -n "$response" ]; then
    echo "✅ Response: $response"
else
    echo "❌ No response"
fi

# Test 3: Try authentication
echo -n "3. POST /auth/login: "
login_response=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' 2>/dev/null)

if echo "$login_response" | grep -q "access_token"; then
    echo "✅ Login successful"
    token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token: ${token:0:20}..."
    
    # Test with authentication
    echo -n "4. GET /users (authenticated): "
    auth_response=$(curl -s "$API_BASE/users" -H "Authorization: Bearer $token" 2>/dev/null)
    if echo "$auth_response" | grep -q "employeeId"; then
        echo "✅ EmployeeId field present"
        
        # Show sample data
        echo ""
        echo "📄 Sample User Data:"
        echo "$auth_response" | python3 -m json.tool 2>/dev/null | head -15 || echo "$auth_response" | head -5
        
    else
        echo "⚠️  No employeeId field"
        echo "   Response: ${auth_response:0:100}..."
    fi
    
    # Test shifts endpoint
    echo ""
    echo -n "5. GET /shifts (authenticated): "
    shifts_response=$(curl -s "$API_BASE/shifts" -H "Authorization: Bearer $token" 2>/dev/null)
    if echo "$shifts_response" | grep -q "employeeId"; then
        echo "✅ User.employeeId field present in shifts"
    else
        echo "⚠️  No user.employeeId in shifts"
    fi
    
else
    echo "❌ Login failed"
    echo "   Response: $login_response"
fi

echo ""
echo "✅ Basic endpoint testing completed"
echo "📅 $(date)"

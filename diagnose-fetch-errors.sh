#!/bin/bash

echo "🔍 FRONTEND FETCH ERROR DIAGNOSIS"
echo "================================="
echo

# 1. Check Environment Configuration
echo "📋 1. ENVIRONMENT CONFIGURATION CHECK"
echo "-------------------------------------"
echo "Frontend .env.local:"
if [ -f "frontend/.env.local" ]; then
    cat frontend/.env.local
    echo "✅ File exists"
else
    echo "❌ frontend/.env.local not found"
fi
echo

echo "Backend .env:"
if [ -f "backend/.env" ]; then
    cat backend/.env | grep -v "TELEGRAM_BOT_TOKEN"
    echo "✅ File exists"
else
    echo "❌ backend/.env not found"
fi
echo

# 2. Check Service Status
echo "📋 2. SERVICE STATUS CHECK"
echo "--------------------------"
echo "Checking port 3000 (Frontend):"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Port 3000 is in use"
    lsof -i :3000
else
    echo "❌ Port 3000 is not in use - Frontend not running"
fi
echo

echo "Checking port 3001 (Backend):"
if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ Port 3001 is in use"
    lsof -i :3001
else
    echo "❌ Port 3001 is not in use - Backend not running"
fi
echo

echo "Checking port 5433 (Database):"
if lsof -i :5433 >/dev/null 2>&1; then
    echo "✅ Port 5433 is in use"
    lsof -i :5433
else
    echo "❌ Port 5433 is not in use - Database not running"
fi
echo

# 3. Test API Connectivity
echo "📋 3. API CONNECTIVITY TEST"
echo "---------------------------"
echo "Testing backend health endpoint:"
if curl -s -f http://localhost:3001 -m 5 >/dev/null 2>&1; then
    echo "✅ Backend is responding at http://localhost:3001"
    echo "Response:"
    curl -s http://localhost:3001 -m 5
else
    echo "❌ Backend is not responding at http://localhost:3001"
fi
echo

echo "Testing backend API docs:"
if curl -s -f http://localhost:3001/api/docs -m 5 >/dev/null 2>&1; then
    echo "✅ API docs accessible at http://localhost:3001/api/docs"
else
    echo "❌ API docs not accessible"
fi
echo

# 4. Check for remaining wrong port references
echo "📋 4. WRONG PORT REFERENCES CHECK"
echo "---------------------------------"
echo "Checking for remaining 3002 references in main files:"
WRONG_PORTS=$(find frontend/src -name "*.ts" -o -name "*.tsx" | grep -v backup | grep -v improved | grep -v working | grep -v fixed | xargs grep "3002" 2>/dev/null | grep -v node_modules)
if [ -z "$WRONG_PORTS" ]; then
    echo "✅ No wrong port references found in main files"
else
    echo "❌ Found wrong port references:"
    echo "$WRONG_PORTS"
fi
echo

# 5. Database connectivity check
echo "📋 5. DATABASE CONNECTIVITY CHECK"
echo "---------------------------------"
if command -v psql >/dev/null 2>&1; then
    echo "Testing database connection:"
    if PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d rsud_anugerah -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
    fi
else
    echo "⚠️  psql not available for testing"
fi
echo

# 6. Common Solutions
echo "📋 6. COMMON SOLUTIONS FOR FETCH ERRORS"
echo "---------------------------------------"
echo "If you're seeing fetch errors, try these steps:"
echo
echo "1. Start Backend:"
echo "   cd backend && npm run start:dev"
echo
echo "2. Start Frontend:"
echo "   cd frontend && npm run dev"
echo
echo "3. Start Database (if using Docker):"
echo "   docker-compose up postgres"
echo
echo "4. Clear browser cache and cookies"
echo
echo "5. Check browser console for specific error messages"
echo
echo "6. Verify network tab shows requests going to localhost:3001"
echo

echo "🔧 QUICK START COMMANDS"
echo "======================="
echo "# Terminal 1 - Database"
echo "docker-compose up postgres"
echo
echo "# Terminal 2 - Backend"
echo "cd backend && npm run start:dev"
echo
echo "# Terminal 3 - Frontend"
echo "cd frontend && npm run dev"

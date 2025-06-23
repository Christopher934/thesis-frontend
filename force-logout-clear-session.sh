#!/bin/bash

# 🔄 FORCE LOGOUT & CLEAR USER SESSION SCRIPT
# This script helps clear browser session when database is reset

echo "🔄 =================================="
echo "🔄 FORCE LOGOUT & CLEAR SESSION"
echo "🔄 =================================="

echo ""
echo "🔍 Problem Analysis:"
echo "   - Database was reset but user didn't logout first"
echo "   - JWT token still stored in browser localStorage"
echo "   - Frontend still thinks user is logged in"
echo "   - Backend user no longer exists in database"
echo ""

echo "💡 Solutions Available:"
echo ""

echo "🎯 SOLUTION 1: Clear Browser Data (Recommended)"
echo "   1. Open browser Developer Tools (F12)"
echo "   2. Go to Application/Storage tab"
echo "   3. Clear localStorage for localhost:3000"
echo "   4. Refresh the page"
echo ""

echo "🎯 SOLUTION 2: Manual Logout API Call"
echo "   1. Clear JWT token from localStorage manually"
echo "   2. Redirect to login page"
echo ""

echo "🎯 SOLUTION 3: Add Auto-Logout on Invalid Token"
echo "   1. Update frontend to handle invalid JWT responses"
echo "   2. Auto-logout when backend returns 401/403"
echo ""

echo "⚡ QUICK FIX COMMANDS:"
echo ""

echo "📱 For Chrome/Edge:"
echo "   1. Press F12"
echo "   2. Console tab"
echo "   3. Run: localStorage.clear()"
echo "   4. Refresh page (F5)"
echo ""

echo "🔧 Manual localStorage commands:"
echo "   // Check current token"
echo "   console.log(localStorage.getItem('token'))"
echo ""
echo "   // Clear specific token"
echo "   localStorage.removeItem('token')"
echo "   localStorage.removeItem('user')"
echo ""
echo "   // Clear everything"
echo "   localStorage.clear()"
echo ""

echo "🔄 After clearing localStorage:"
echo "   1. Refresh the page"
echo "   2. You should be redirected to login"
echo "   3. Login with new users from seed:"
echo "      - admin@rsud.id (password: password123)"
echo "      - perawat1@rsud.id (password: password123)"
echo "      - staff1@rsud.id (password: password123)"
echo "      - supervisor1@rsud.id (password: password123)"
echo ""

echo "✅ This will resolve the session mismatch issue!"

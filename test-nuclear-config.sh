#!/bin/bash
cd "/Users/jo/Documents/Backup 2/Thesis/frontend"

echo "🔧 Testing Nuclear Configuration..."
echo "=================================="

# Check config file
echo "✅ Checking next.config.mjs..."
if [ -f "next.config.mjs" ]; then
    echo "✅ Configuration file exists"
    node -c next.config.mjs && echo "✅ Configuration syntax is valid" || echo "❌ Configuration has syntax errors"
else
    echo "❌ Configuration file missing"
fi

# Check for babel issues
echo ""
echo "🔍 Checking for Babel issues..."
if npm run lint --silent 2>/dev/null; then
    echo "✅ No ESLint/Babel errors"
else
    echo "⚠️  ESLint/Babel warnings detected (but may still work)"
fi

echo ""
echo "🚀 Starting Next.js server..."
echo "Press Ctrl+C to stop"
echo ""
npm run dev

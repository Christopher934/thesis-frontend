#!/bin/zsh

echo "📊 WEBPACK CACHE STATUS MONITOR"
echo "==============================="

echo "🔍 Checking for problematic cache files..."

# Check for problematic webpack cache files
if [ -d ".next/cache/webpack" ]; then
    echo "📁 Webpack cache directory exists:"
    ls -la .next/cache/webpack/ 2>/dev/null || echo "  (empty or inaccessible)"
    
    echo ""
    echo "🔍 Looking for problematic .pack.gz files..."
    find .next/cache/webpack -name "*.pack.gz*" 2>/dev/null || echo "  No .pack.gz files found ✅"
    
    echo ""
    echo "💾 Cache directory size:"
    du -sh .next/cache 2>/dev/null || echo "  No cache directory"
else
    echo "✅ No webpack cache directory found (cache disabled)"
fi

echo ""
echo "🚀 Development server status:"
ps aux | grep -E "(next dev|webpack)" | grep -v grep | head -5

echo ""
echo "🌐 Port status:"
lsof -i :3000 2>/dev/null | head -3

echo ""
echo "💡 Recommendations:"
if [ -d ".next/cache/webpack" ]; then
    echo "  - Cache is enabled and may cause errors"
    echo "  - Use: ./fix-webpack-cache.sh to disable cache"
    echo "  - Or use: npm run dev:no-cache"
else
    echo "  ✅ Cache is properly disabled"
    echo "  - Use: npm run dev for normal development"
    echo "  - Use: npm run dev:fast for faster startup"
fi

#!/bin/zsh

echo "🔍 NEXT.JS CHUNK DIAGNOSTIC"
echo "==========================="

echo "📁 Checking .next directory structure..."
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
    
    echo ""
    echo "📦 Static chunks status:"
    if [ -d ".next/static/chunks" ]; then
        echo "✅ Chunks directory exists"
        echo "Number of chunk files: $(find .next/static/chunks -name "*.js" | wc -l)"
        echo "Recent chunks:"
        ls -la .next/static/chunks/ | head -10
    else
        echo "❌ No chunks directory found"
    fi
    
    echo ""
    echo "🎨 CSS files status:"
    if [ -d ".next/static/css" ]; then
        echo "✅ CSS directory exists"
        echo "Number of CSS files: $(find .next/static/css -name "*.css" | wc -l)"
    else
        echo "❌ No CSS directory found"
    fi
    
else
    echo "❌ .next directory missing - this is the problem!"
    echo "The development server needs to compile the app first."
fi

echo ""
echo "🌐 Development server status:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Server running on port 3000"
    echo "Process details:"
    lsof -i :3000 | head -3
else
    echo "❌ No server running on port 3000"
fi

echo ""
echo "💡 Recommendations:"
if [ ! -d ".next" ]; then
    echo "- Start development server: npm run dev:stable"
    echo "- Wait for compilation to complete"
elif [ ! -d ".next/static/chunks" ]; then
    echo "- Restart development server"
    echo "- Check for compilation errors"
else
    echo "✅ Everything looks good!"
    echo "- Chunks should load properly now"
fi

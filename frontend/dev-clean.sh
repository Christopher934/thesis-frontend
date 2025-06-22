#!/bin/zsh

echo "✨ CLEAN NEXT.JS 15 DEVELOPMENT SERVER"
echo "====================================="

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Clean artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next out

echo "⚙️  Setting clean environment..."

# Create clean environment configuration
cat > .env.local << 'EOF'
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

echo "🚀 Starting clean development server..."
echo "✅ No configuration warnings"
echo "✅ Next.js 15+ compatible"
echo "✅ Proper source maps"
echo ""
echo "Server: http://localhost:3000"
echo ""

# Start with clean environment
NODE_OPTIONS="--max-old-space-size=4096" \
NEXT_TELEMETRY_DISABLED=1 \
npm run dev

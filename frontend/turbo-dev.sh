#!/bin/zsh

echo "🚀 ULTIMATE LOCALHOST PERFORMANCE FIX"
echo "======================================"

# Kill all existing processes that might be interfering
echo "🛑 Stopping all interfering processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true

# Clean ALL cache and temporary files
echo "🧹 Deep cleaning all cache files..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf ~/.npm/_cacache
rm -rf /tmp/next-*
rm -rf .next/cache

# Clear system DNS cache (macOS specific)
echo "🌐 Clearing DNS cache..."
sudo dscacheutil -flushcache 2>/dev/null || true
sudo killall -HUP mDNSResponder 2>/dev/null || true

# Optimize Node.js memory and performance
echo "⚡ Setting performance environment variables..."
export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=512"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PRIVATE_SKIP_VALIDATION=1
export CI=true

# Create optimized .env.local for development
echo "📝 Creating optimized environment configuration..."
cat > .env.local << 'EOF'
# Performance optimizations
NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_SKIP_VALIDATION=1
NODE_ENV=development

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3001

# Disable unnecessary features for speed
NEXT_PRIVATE_STANDALONE=false
NEXT_PRIVATE_DEBUG_CACHE=false
EOF

# Start with maximum performance settings
echo "🚀 Starting optimized development server..."
echo "Server will be available at: http://localhost:3000"
echo "This should be MUCH faster now!"
echo ""

# Use the fastest possible configuration
FORCE_COLOR=1 \
NODE_OPTIONS="--max-old-space-size=8192" \
NEXT_TELEMETRY_DISABLED=1 \
npm run dev

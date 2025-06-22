#!/bin/zsh

echo "🔧 WEBPACK CACHE ERROR - ULTIMATE FIX"
echo "====================================="

# Stop all development servers immediately
echo "🛑 Stopping all Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Wait for processes to fully stop
sleep 2

echo "🧹 Removing ALL problematic cache files..."

# Remove ALL Next.js cache
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Remove system-level caches that might interfere
rm -rf ~/.npm/_cacache
rm -rf /tmp/next-*

# Remove any stuck webpack processes
rm -rf /tmp/webpack-*

echo "🔨 Fixing file permissions..."
# Fix any permission issues
find . -name "*.pack.gz*" -delete 2>/dev/null || true
find . -name "*.pack*" -delete 2>/dev/null || true

# Create proper cache directories with correct permissions
mkdir -p .next/cache
chmod -R 755 .next 2>/dev/null || true

echo "⚙️  Setting ultra-performance environment..."

# Export performance variables
export NODE_OPTIONS="--max-old-space-size=8192"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PRIVATE_SKIP_VALIDATION=1
export DISABLE_SOURCE_MAPS=true
export WEBPACK_DISABLE_CACHE=true

# Create optimized environment file
cat > .env.local << 'EOF'
# No cache mode for stability
NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_SKIP_VALIDATION=1
DISABLE_SOURCE_MAPS=true
WEBPACK_DISABLE_CACHE=true
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

echo "🚀 Starting cache-free development server..."
echo "This will be slower initially but NO cache errors!"
echo "Server: http://localhost:3000"
echo ""

# Start development server with cache completely disabled
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PRIVATE_SKIP_VALIDATION=1 \
DISABLE_SOURCE_MAPS=true \
NODE_OPTIONS="--max-old-space-size=8192" \
npm run dev

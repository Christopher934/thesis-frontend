#!/bin/zsh

echo "⚡ ULTRA-FAST NAVIGATION DEVELOPMENT MODE"
echo "========================================"

# Kill existing processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true

# Clean cache for fresh start
echo "🧹 Cleaning cache for optimal performance..."
rm -rf .next out node_modules/.cache

# Set maximum performance environment variables
export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=512"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PRIVATE_SKIP_VALIDATION=1
export DISABLE_SOURCE_MAPS=true
export FORCE_COLOR=1

# Create ultra-optimized environment
cat > .env.local << 'EOF'
# Ultra performance mode
NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_SKIP_VALIDATION=1
DISABLE_SOURCE_MAPS=true
NODE_ENV=development

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

echo "🚀 Starting ULTRA-FAST development server..."
echo "Navigation should be INSTANT now!"
echo "Access: http://localhost:3000"
echo ""

# Start with all optimizations enabled
npm run dev:ultra

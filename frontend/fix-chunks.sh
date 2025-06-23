#!/bin/zsh

echo "🔧 FIXING NEXT.JS CHUNK 404 ERRORS"
echo "=================================="

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Clean all artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next out node_modules/.cache

# Set stable environment variables
echo "⚙️  Setting stable development environment..."
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# Create stable environment configuration
cat > .env.local << 'EOF'
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

echo "🔨 Building stable development environment..."

# First, ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting stable development server..."
echo "This should fix the 404 chunk errors"
echo "Server: http://localhost:3000"
echo ""

# Start with stable configuration
npm run dev

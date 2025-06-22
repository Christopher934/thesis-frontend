#!/bin/bash

echo "🚨 NUCLEAR RESTART - ELIMINATING CHUNKS FOREVER"
echo "==============================================="

# Kill all processes
echo "🔥 Killing all Next.js processes..."
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Nuclear cleanup
echo "🧹 Nuclear cleanup..."
cd "/Users/jo/Documents/Backup 2/Thesis/frontend"
rm -rf .next node_modules/.cache out .swc dist 2>/dev/null || true
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

# Wait a moment
sleep 3

# Start with nuclear config
echo "🚀 Starting with NUCLEAR configuration..."
NEXT_TELEMETRY_DISABLED=1 NODE_ENV=development npm run dev

echo "✅ Nuclear restart complete!"

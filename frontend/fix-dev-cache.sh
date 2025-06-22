#!/bin/bash

echo "🔧 Fixing Next.js Development Performance Issues"
echo "==============================================="

# Stop any running development servers
echo "🛑 Stopping any running development servers..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next.*dev" 2>/dev/null || true

# Clean all cache and build artifacts
echo "🧹 Cleaning all cache and build artifacts..."
rm -rf .next
rm -rf out  
rm -rf node_modules/.cache
rm -rf .next/cache

# Create cache directory with proper permissions
echo "📁 Creating cache directory..."
mkdir -p .next/cache/webpack
chmod 755 .next/cache/webpack

# Restart development server
echo "🚀 Restarting development server..."
echo "This should fix the webpack caching errors"
echo "Press Ctrl+C to stop when ready"

# Use the optimized settings
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

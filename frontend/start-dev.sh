#!/bin/bash

echo "🚀 Starting RSUD Anugerah Frontend Development Server"
echo "=============================================="

# Check Node.js version
echo "📋 System Information:"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Clean build artifacts and problematic cache
echo ""
echo "🧹 Cleaning build artifacts and cache..."
rm -rf .next out node_modules/.cache
rm -rf .next/cache/webpack

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server with optimizations
echo ""
echo "🌐 Starting Next.js development server..."
echo "The server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Set environment variables for better performance
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_PRIVATE_SKIP_VALIDATION=1

# Start the server
echo "Using optimized development settings..."
npm run dev

#!/bin/bash

echo "🚀 Starting frontend development server..."

cd /Users/jo/Downloads/Thesis/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export NODE_OPTIONS='--max-old-space-size=4096'
export NEXT_TELEMETRY_DISABLED=1

# Start development server
echo "⚡ Starting Next.js server on port 3333..."
npx next dev -p 3333 --turbo

#!/bin/bash

echo "🚀 Starting Backend Server..."
echo "=============================="

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Run this script from the root directory of the project"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
fi

# Start the development server
echo "🔥 Starting NestJS development server..."
npm run start:dev

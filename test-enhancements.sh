#!/bin/bash

echo "Testing frontend build with new components..."

cd /Users/jo/Downloads/Thesis/frontend

echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "Testing backend build..."
cd ../backend

npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed!"
    exit 1
fi

echo "🎉 All builds successful! Enhancements are ready to test."

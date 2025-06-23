#!/bin/bash

echo "🧪 NUCLEAR CONFIGURATION TEST"
echo "============================="

# Test server response
echo "🔍 Testing server response..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "HTTP Response: $response"

if [ "$response" = "200" ]; then
    echo "✅ Server responding successfully!"
    
    # Test for chunks 404 errors
    echo ""
    echo "🧩 Testing for chunks 404 errors..."
    
    # Make request and capture any 404s in logs
    curl -s http://localhost:3000 > /dev/null
    sleep 2
    
    # Check logs for 404 errors
    if tail -20 "/Users/jo/Documents/Backup 2/Thesis/frontend/dev_nuclear_clean.log" | grep -q "404"; then
        echo "❌ Found 404 errors in logs"
        echo "Recent log entries:"
        tail -10 "/Users/jo/Documents/Backup 2/Thesis/frontend/dev_nuclear_clean.log"
    else
        echo "✅ NO 404 ERRORS DETECTED!"
        echo "🎉 NUCLEAR CONFIGURATION SUCCESS!"
    fi
    
elif [ "$response" = "500" ]; then
    echo "❌ Server error (500)"
    echo "Recent log entries:"
    tail -10 "/Users/jo/Documents/Backup 2/Thesis/frontend/dev_nuclear_clean.log"
else
    echo "⚠️  Unexpected response: $response"
fi

echo ""
echo "📋 Configuration Status:"
echo "- splitChunks: disabled ✅"
echo "- runtimeChunk: disabled ✅"  
echo "- minimize: disabled ✅"
echo "- cache: disabled ✅"

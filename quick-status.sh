#!/bin/bash

echo "🔍 System Status Check"
echo "====================="

# Check processes
echo "Active processes:"
ps aux | grep -E "(next|nest)" | grep -v grep || echo "No Next.js or NestJS processes found"

echo ""
echo "Port status:"
netstat -an | grep -E "(3000|8080)" || echo "Ports 3000 and 8080 are available"

echo ""
echo "✨ Status check complete"

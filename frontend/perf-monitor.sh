#!/bin/zsh

echo "📊 LOCALHOST PERFORMANCE MONITOR"
echo "================================"

# Check system resources
echo "🖥️  System Resources:"
echo "Memory Usage: $(ps aux | awk '{sum+=$6} END {print sum/1024 " MB"}')"
echo "CPU Usage: $(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')"
echo "Disk Space: $(df -h . | tail -1 | awk '{print $4}' | sed 's/Gi/ GB/')"

# Check Node.js processes
echo ""
echo "🚀 Node.js Processes:"
ps aux | grep -E "(node|next)" | grep -v grep

# Check port usage
echo ""
echo "🌐 Port Usage:"
lsof -i :3000 | head -10
lsof -i :3001 | head -10

# Check Next.js cache size
echo ""
echo "💾 Cache Information:"
if [ -d ".next" ]; then
    echo "Next.js cache size: $(du -sh .next 2>/dev/null | cut -f1)"
else
    echo "No Next.js cache found"
fi

if [ -d "node_modules/.cache" ]; then
    echo "Node modules cache: $(du -sh node_modules/.cache 2>/dev/null | cut -f1)"
else
    echo "No node modules cache found"
fi

# Performance recommendations
echo ""
echo "💡 Performance Recommendations:"
echo "- Use 'npm run dev:turbo' for fastest development"
echo "- Clear cache if experiencing issues: 'rm -rf .next'"
echo "- Monitor memory usage with Activity Monitor"
echo "- Close unnecessary browser tabs and applications"

# Quick system optimization
echo ""
echo "🔧 Quick System Optimization:"
echo "Clearing system caches..."
sudo purge 2>/dev/null || echo "Could not purge system memory (requires sudo)"

echo ""
echo "✅ Performance check complete!"

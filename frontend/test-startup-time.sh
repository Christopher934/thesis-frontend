#!/bin/bash

# 📊 RSUD Frontend Startup Time Monitor
echo "⏱️  MEASURING FRONTEND STARTUP TIME"
echo "==================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Record start time
START_TIME=$(date +%s)

echo -e "${BLUE}🚀 Starting frontend with ultra-fast configuration...${NC}"
echo "Start time: $(date)"
echo ""

# Start the server in background
npm run dev:ultra > dev.log 2>&1 &
DEV_PID=$!

echo "Process ID: $DEV_PID"
echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"

# Monitor for ready signal
READY=false
TIMEOUT=60
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ] && [ $READY = false ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        READY=true
        END_TIME=$(date +%s)
        STARTUP_TIME=$((END_TIME - START_TIME))
        
        echo ""
        echo -e "${GREEN}✅ Frontend is ready!${NC}"
        echo "End time: $(date)"
        echo -e "${GREEN}⚡ Startup time: ${STARTUP_TIME} seconds${NC}"
        
        if [ $STARTUP_TIME -lt 15 ]; then
            echo -e "${GREEN}🎉 EXCELLENT: Under 15 seconds!${NC}"
        elif [ $STARTUP_TIME -lt 30 ]; then
            echo -e "${YELLOW}👍 GOOD: Under 30 seconds${NC}"
        else
            echo -e "${RED}⚠️  SLOW: Over 30 seconds - needs more optimization${NC}"
        fi
        
        # Show last few lines of log
        echo ""
        echo "Latest logs:"
        tail -5 dev.log
        
    else
        echo -n "."
        sleep 1
        ELAPSED=$((ELAPSED + 1))
    fi
done

if [ $READY = false ]; then
    echo ""
    echo -e "${RED}❌ Timeout: Server didn't start within $TIMEOUT seconds${NC}"
    echo "Last logs:"
    tail -10 dev.log
fi

# Stop the server
echo ""
echo -e "${BLUE}🛑 Stopping server...${NC}"
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null

echo -e "${GREEN}✅ Test completed${NC}"

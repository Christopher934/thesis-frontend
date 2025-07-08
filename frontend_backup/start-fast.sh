#!/bin/bash

# 🚀 RSUD Frontend ULTRA FAST Development - Optimized for Speed
echo "⚡ Starting RSUD Frontend in ULTRA FAST MODE"
echo "==========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Preparing ultra-fast environment...${NC}"

# Clean minimal cache (keep useful cache)
rm -rf .next/cache/webpack 2>/dev/null
rm -rf .next/types 2>/dev/null

# Set maximum performance environment variables
export NODE_OPTIONS="--max-old-space-size=2048"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PRIVATE_SKIP_VALIDATION=1
export DISABLE_SOURCE_MAPS=true
export TSC_NONPOLLING_WATCHER=true

echo -e "${GREEN}✅ Ultra-fast environment ready${NC}"
echo -e "${YELLOW}🚀 Starting development server in LIGHTNING mode...${NC}"
echo "⚡ Disabled: Type checking, Source maps, Telemetry, Validation"
echo "🔥 Expected startup: 5-15 seconds"
echo ""

# Start with maximum performance settings
npm run dev:ultra

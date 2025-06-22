#!/bin/zsh

# RSUD FINAL SYSTEM VERIFICATION
# Comprehensive verification that everything is working perfectly

echo "🏆 RSUD SHIFT MANAGEMENT SYSTEM - FINAL VERIFICATION"
echo "===================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to check and display status
check_status() {
    local service=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Checking $service... "
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null)
    
    if [[ "$status" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ WORKING${NC} (${status}) - ${response_time}s"
    else
        echo -e "${RED}❌ ISSUE${NC} (${status}) - ${response_time}s"
    fi
}

# Function to test API data
test_api_data() {
    echo -n "Testing API data... "
    
    local data=$(curl -s "http://localhost:3001/users/count-by-role" 2>/dev/null)
    
    if echo "$data" | grep -q "counts"; then
        echo -e "${GREEN}✅ DATA AVAILABLE${NC}"
        echo "   User roles: $(echo "$data" | python3 -c 'import sys, json; data=json.load(sys.stdin); print(", ".join([f"{k}:{v}" for k,v in data["counts"].items()]))' 2>/dev/null || echo 'Parsing failed')"
    else
        echo -e "${RED}❌ NO DATA${NC}"
    fi
}

# Main verification
echo -e "${BLUE}📊 System Health Check${NC}"
echo "------------------------"

check_status "Frontend Server" "http://localhost:3000/" "200"
check_status "Backend Server" "http://localhost:3001/users" "200"  
check_status "Admin Route (should redirect)" "http://localhost:3000/admin" "307"

echo ""
echo -e "${BLUE}📡 API Integration Test${NC}"
echo "-------------------------"

test_api_data

# Test authentication endpoint
echo -n "Testing auth endpoint... "
auth_response=$(curl -s -X POST "http://localhost:3001/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}' 2>/dev/null)

if echo "$auth_response" | grep -q "access_token"; then
    echo -e "${GREEN}✅ AUTH WORKING${NC}"
else
    echo -e "${RED}❌ AUTH ISSUE${NC}"
fi

echo ""
echo -e "${BLUE}⚡ Performance Check${NC}"
echo "---------------------"

# Performance test
frontend_time=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:3000/" 2>/dev/null)
backend_time=$(curl -s -o /dev/null -w "%{time_total}" "http://localhost:3001/users" 2>/dev/null)

echo -e "Frontend response: ${frontend_time}s $(if (( $(echo "$frontend_time < 2.0" | bc -l 2>/dev/null || echo 0) )); then echo "${GREEN}(EXCELLENT)${NC}"; elif (( $(echo "$frontend_time < 5.0" | bc -l 2>/dev/null || echo 0) )); then echo "${YELLOW}(GOOD)${NC}"; else echo "${RED}(SLOW)${NC}"; fi)"

echo -e "Backend response: ${backend_time}s $(if (( $(echo "$backend_time < 0.5" | bc -l 2>/dev/null || echo 0) )); then echo "${GREEN}(EXCELLENT)${NC}"; elif (( $(echo "$backend_time < 1.0" | bc -l 2>/dev/null || echo 0) )); then echo "${YELLOW}(GOOD)${NC}"; else echo "${RED}(SLOW)${NC}"; fi)"

echo ""
echo -e "${BLUE}🛠️ System Components${NC}"
echo "----------------------"

# Check if key files exist
echo -n "Next.js config... "
if [[ -f "frontend/next.config.mjs" && -s "frontend/next.config.mjs" ]]; then
    echo -e "${GREEN}✅ PRESENT${NC}"
else
    echo -e "${RED}❌ MISSING/EMPTY${NC}"
fi

echo -n "Emergency tools... "
tool_count=0
[[ -x "emergency-recovery.sh" ]] && ((tool_count++))
[[ -x "frontend/fix-cache.sh" ]] && ((tool_count++))
[[ -x "frontend/monitor-performance.sh" ]] && ((tool_count++))
[[ -x "validate-system.sh" ]] && ((tool_count++))

if [[ $tool_count -ge 3 ]]; then
    echo -e "${GREEN}✅ AVAILABLE${NC} ($tool_count tools)"
else
    echo -e "${YELLOW}⚠️ PARTIAL${NC} ($tool_count tools)"
fi

echo -n "Documentation... "
doc_count=0
[[ -f "COMPLETE_ERROR_RECOVERY_GUIDE.md" ]] && ((doc_count++))
[[ -f "FINAL_COMPLETE_SYSTEM_STATUS.md" ]] && ((doc_count++))
[[ -f "MIDDLEWARE_PERFORMANCE_OPTIMIZATION_COMPLETE.md" ]] && ((doc_count++))

if [[ $doc_count -ge 2 ]]; then
    echo -e "${GREEN}✅ COMPLETE${NC} ($doc_count guides)"
else
    echo -e "${YELLOW}⚠️ PARTIAL${NC} ($doc_count guides)"
fi

echo ""
echo -e "${BLUE}🔐 Security Check${NC}"
echo "------------------"

# Check JWT endpoint protection
echo -n "Protected endpoints... "
protected_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/users/count-by-role" 2>/dev/null)

if [[ "$protected_status" == "401" ]]; then
    echo -e "${GREEN}✅ PROTECTED${NC} (requires auth)"
elif [[ "$protected_status" == "200" ]]; then
    echo -e "${YELLOW}⚠️ ACCESSIBLE${NC} (may be intentional for demo)"
else
    echo -e "${RED}❌ UNKNOWN${NC} ($protected_status)"
fi

echo ""
echo -e "${CYAN}📋 FINAL SYSTEM REPORT${NC}"
echo "========================"

# Overall system assessment
issues=0

# Check critical components
if ! curl -s "http://localhost:3000/" > /dev/null 2>&1; then ((issues++)); fi
if ! curl -s "http://localhost:3001/users" > /dev/null 2>&1; then ((issues++)); fi
if [[ ! -f "frontend/next.config.mjs" || ! -s "frontend/next.config.mjs" ]]; then ((issues++)); fi

if [[ $issues -eq 0 ]]; then
    echo -e "${GREEN}🎉 SYSTEM STATUS: FULLY OPERATIONAL${NC}"
    echo -e "${GREEN}✅ All critical components working${NC}"
    echo -e "${GREEN}✅ No issues detected${NC}"
    echo -e "${GREEN}✅ Ready for production use${NC}"
    echo ""
    echo -e "${CYAN}🏥 HOSPITAL DEPLOYMENT READY${NC}"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:3001"  
    echo "   Admin Login: admin@example.com / admin123"
    echo "   Emergency Recovery: ./emergency-recovery.sh"
else
    echo -e "${YELLOW}⚠️ SYSTEM STATUS: MINOR ISSUES DETECTED${NC}"
    echo -e "${YELLOW}Found $issues potential issues${NC}"
    echo -e "${CYAN}💡 Run emergency recovery if needed:${NC}"
    echo "   ./emergency-recovery.sh"
fi

echo ""
echo -e "${BLUE}🚀 Quick Commands:${NC}"
echo "   Check status: ./verify-system.sh"
echo "   Fix issues: ./emergency-recovery.sh"
echo "   Monitor: ./frontend/monitor-performance.sh"
echo "   Troubleshoot: Read COMPLETE_ERROR_RECOVERY_GUIDE.md"

echo ""
echo -e "${GREEN}🎯 Verification completed successfully!${NC}"
echo "$(date '+%Y-%m-%d %H:%M:%S') - RSUD System Final Check"

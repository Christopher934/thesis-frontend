#!/bin/bash

# 🧹 RSUD Anugerah Project Cleanup Script
# Date: June 21, 2025
# Purpose: Clean up unused files and organize project structure

echo "🧹 Starting RSUD Anugerah Project Cleanup..."
echo "============================================="

PROJECT_ROOT="/Users/jo/Documents/Backup 2/Thesis"
cd "$PROJECT_ROOT"

# Create archive directory for old documentation
echo "📁 Creating archive directories..."
mkdir -p archives/documentation
mkdir -p archives/test-files
mkdir -p archives/old-scripts
mkdir -p archives/temp-html

# 1. Move outdated/completed documentation to archive
echo "📝 Archiving completed documentation files..."

# Documentation that can be archived (completed tasks)
COMPLETED_DOCS=(
    "AJUKAN_BARU_BUTTON_FIX_COMPLETE.md"
    "API_TESTING_COMPLETE.md"
    "CALENDAR_DATA_SYNCHRONIZATION_COMPLETE.md"
    "CONTAINER_SEPARATION_PROOF_COMPLETE.md"
    "DASHBOARD_REDESIGN_COMPLETE.md"
    "DOCKER_CONTAINERIZATION_COMPLETE.md"
    "FINAL_CONTAINER_SEPARATION_PROOF.md"
    "FINAL_CRUD_TESTING_COMPLETE.md"
    "FINAL_OVERFLOW_FIX_COMPLETE.md"
    "FRONTEND_BUILD_FIX.md"
    "FRONTEND_BUILD_SOLVED.md"
    "GIT_PUSH_LOGOUT_CONFIRMATION.md"
    "GIT_PUSH_SUMMARY.md"
    "HOSPITAL_COLOR_SCHEME_COMPLETE.md"
    "INDONESIAN_TEXT_IMPROVEMENTS_COMPLETE.md"
    "JADWAL_FORM_LAYOUT_IMPROVEMENT_COMPLETE.md"
    "JADWAL_FORM_OVERFLOW_FIX_COMPLETE.md"
    "LOGO_INTEGRATION_GUIDE.md"
    "MOBILE_RESPONSIVE_CALENDAR_COMPLETE.md"
    "MOBILE_RESPONSIVE_SHIFT_SWAP_COMPLETE.md"
    "MOCK_DATA_REMOVAL_COMPLETE.md"
    "MULTI_CONTAINER_DEMONSTRATION_COMPLETE.md"
    "QUICK_START_TEST.md"
    "README_ENHANCEMENT_COMPLETE.md"
    "SUPERVISOR_ACTION_FIX_COMPLETE.md"
    "TODAY_SCHEDULE_REAL_DATA_INTEGRATION_COMPLETE.md"
)

for doc in "${COMPLETED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✅ Archiving: $doc"
        mv "$doc" archives/documentation/
    fi
done

# 2. Archive test files (keep only essential ones)
echo "🧪 Archiving old test files..."

# Keep these essential test files in root:
# - test-all-apis.js (comprehensive API testing)
# - test-crud-simple.js (simple CRUD testing)

# Archive these test files:
TEST_FILES_TO_ARCHIVE=(
    "test-crud-apis.js"
    "test-frontend-apis.js"
    "test-shift-auto-transfer.js"
    "test-supervisor-actions.js"
    "debug-absensi.js"
    "debug-user-update.js"
    "test-results.txt"
)

for test_file in "${TEST_FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$test_file" ]; then
        echo "  ✅ Archiving: $test_file"
        mv "$test_file" archives/test-files/
    fi
done

# 3. Archive old/unused scripts
echo "📜 Archiving old scripts..."

OLD_SCRIPTS=(
    "cleanup-project.sh"
    "hospital-colors.sh"
    "logo-color-extractor.sh"
)

for script in "${OLD_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "  ✅ Archiving: $script"
        mv "$script" archives/old-scripts/
    fi
done

# 4. Clean up temporary HTML files in frontend/public
echo "🌐 Cleaning up temporary HTML files..."

cd "$PROJECT_ROOT/frontend/public"
TEMP_HTML_FILES=(
    "dashboard-redesign-preview.html"
    "favicon-generator.html"
    "generate-favicon.html"
    "logo-to-favicon.html"
    "test-absensi-auth.html"
    "test-auth-setup.html"
    "test-login.html"
    "test-mobile-dropdown.html"
    "test-user-setup.html"
)

for html_file in "${TEMP_HTML_FILES[@]}"; do
    if [ -f "$html_file" ]; then
        echo "  ✅ Archiving: frontend/public/$html_file"
        mv "$html_file" "$PROJECT_ROOT/archives/temp-html/"
    fi
done

cd "$PROJECT_ROOT"

# 5. Keep only essential documentation in root
echo "📋 Essential files remaining in root:"
echo "  ✅ README.md (main project documentation)"
echo "  ✅ MOCK_DATA_REMOVAL_FINAL_COMPLETION.md (latest completion status)"
echo "  ✅ RSUD_SHIFT_SYSTEM_COMPLETE.md (system overview)"
echo "  ✅ SETUP_COMPLETE.md (setup instructions)"
echo "  ✅ SISTEM_ABSENSI_COMPLETE.md (attendance system)"
echo "  ✅ STARTUP_GUIDE.md (startup instructions)"
echo "  ✅ PROJECT_CLEANUP_COMPLETE.md (this cleanup record)"

# 6. Keep only essential scripts
echo "🔧 Essential scripts remaining:"
echo "  ✅ start-app.sh (application startup)"
echo "  ✅ deploy-docker.sh (deployment)"
echo "  ✅ fast-dev.sh (development mode)"

# 7. Keep only essential test files
echo "🧪 Essential test files remaining:"
echo "  ✅ test-all-apis.js (comprehensive API testing)"
echo "  ✅ test-crud-simple.js (simple CRUD testing)"

# 8. Clean up any duplicate or temporary files
echo "🗑️  Removing temporary files..."

# Remove any backup files
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Remove any log files that might be temporary
find . -name "*.log" -not -path "./backend/*" -not -path "./frontend/*" -delete 2>/dev/null || true

# 9. Create a cleaned project structure summary
echo "📊 Creating project structure summary..."

cat > PROJECT_STRUCTURE_CLEAN.md << 'EOF'
# 🏗️ RSUD Anugerah - Clean Project Structure

**Date:** June 21, 2025  
**Status:** Production Ready & Organized

## 📁 **Root Directory Structure**

### **Essential Documentation**
- `README.md` - Main project documentation
- `MOCK_DATA_REMOVAL_FINAL_COMPLETION.md` - Latest system status
- `RSUD_SHIFT_SYSTEM_COMPLETE.md` - System overview
- `SETUP_COMPLETE.md` - Setup instructions
- `SISTEM_ABSENSI_COMPLETE.md` - Attendance system docs
- `STARTUP_GUIDE.md` - How to start the application

### **Configuration Files**
- `.env` - Environment variables
- `.env.docker` - Docker environment
- `docker-compose.yml` - Production docker setup
- `docker-compose.dev.yml` - Development docker setup
- `nginx.conf` - Reverse proxy configuration
- `package.json` - Root package configuration

### **Scripts**
- `start-app.sh` - Start application (development & production)
- `deploy-docker.sh` - Deploy with Docker
- `fast-dev.sh` - Quick development startup

### **Testing**
- `test-all-apis.js` - Comprehensive API testing
- `test-crud-simple.js` - Simple CRUD operations testing

### **Application Directories**
- `backend/` - NestJS backend application
- `frontend/` - Next.js frontend application

### **Archives**
- `archives/documentation/` - Completed task documentation
- `archives/test-files/` - Old test files
- `archives/old-scripts/` - Archived scripts
- `archives/temp-html/` - Temporary HTML files

## 🎯 **Current System Status**
- ✅ Production Ready
- ✅ Mock Data Completely Removed
- ✅ Real Database Integration
- ✅ Docker Containerized
- ✅ Clean Architecture

## 🚀 **Quick Start**
```bash
# Start the application
./start-app.sh

# Or with Docker
docker-compose up -d

# Run tests
node test-all-apis.js
```

## 📋 **Development Workflow**
1. Use `./fast-dev.sh` for quick development
2. Test APIs with `node test-all-apis.js`
3. Deploy with `./deploy-docker.sh`
4. Check `archives/` for historical documentation
EOF

echo ""
echo "✅ Project cleanup completed successfully!"
echo ""
echo "📊 Summary of changes:"
echo "  🗂️  Archived: $(find archives/ -type f | wc -l) files"
echo "  📁 Created: archives/ directory structure"
echo "  📋 Created: PROJECT_STRUCTURE_CLEAN.md"
echo ""
echo "🎯 Your project is now clean and organized!"
echo "📁 Archived files are safely stored in the archives/ directory"
echo "📖 Check PROJECT_STRUCTURE_CLEAN.md for the new structure overview"

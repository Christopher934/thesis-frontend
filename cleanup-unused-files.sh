#!/bin/bash

# 🗑️ CLEANUP UNUSED FILES - RSUD ANUGERAH
# This script removes development artifacts, logs, and unused files

echo "🗑️ CLEANING UP UNUSED FILES"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m' 
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}🔹 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Count files to be removed
count_files() {
    local count=0
    
    # Development documentation files
    for file in *_COMPLETE.md *_SUCCESS.md *_STATUS*.md *_FIXES*.md *_FINAL*.md; do
        [ -f "$file" ] && ((count++))
    done
    
    # Log files
    for file in *.log; do
        [ -f "$file" ] && ((count++))
    done
    
    # Test and development scripts (selective)
    local test_scripts=(
        "blackbox-test-suite.js"
        "test-all-apis.js"
        "test-all-notifications.js"
        "test-api-notifications.js"
        "test-crud-simple.js"
        "test-event-notification.js"
        "test-event-simple.js"
        "test-notification-*.js"
        "test-notification-*.sh"
        "test-system-notifications.js"
        "notification-test-summary.js"
        "create-test-notifications.js"
    )
    
    for pattern in "${test_scripts[@]}"; do
        for file in $pattern; do
            [ -f "$file" ] && ((count++))
        done
    done
    
    # Development utility scripts
    local dev_scripts=(
        "check-chunks-status.sh"
        "clear-notifications*.sh"
        "clear-session-and-test.sh"
        "comprehensive-api-test.sh"
        "demo-telegram-bot*.sh"
        "emergency-recovery.sh"
        "fix-chunks-404.sh"
        "fix-session-mismatch.sh"
        "force-logout-clear-session.sh"
        "monitor-system-health.sh"
        "nuclear-restart.sh"
        "project-cleanup-final.sh"
        "quick-api-test.sh"
        "quick-reset-db.sh"
        "run-blackbox-tests.sh"
        "setup-notification-test.sh"
        "setup-test-users.sh"
        "test-chunks-404.sh"
        "test-new-users-after-reset.sh"
        "test-nuclear-config.sh"
        "validate-system.sh"
        "verify-*.sh"
    )
    
    for pattern in "${dev_scripts[@]}"; do
        for file in $pattern; do
            [ -f "$file" ] && ((count++))
        done
    done
    
    echo $count
}

# Main cleanup function
cleanup_files() {
    local removed_count=0
    
    print_step "Removing development documentation files..."
    
    # Remove development status/completion documentation
    for file in *_COMPLETE.md *_SUCCESS.md *_STATUS*.md *_FIXES*.md *_FINAL*.md; do
        if [ -f "$file" ]; then
            echo "  Removing: $file"
            rm "$file"
            ((removed_count++))
        fi
    done
    
    print_step "Removing log files..."
    
    # Remove log files
    for file in *.log; do
        if [ -f "$file" ]; then
            echo "  Removing: $file"
            rm "$file"
            ((removed_count++))
        fi
    done
    
    print_step "Removing test scripts and utilities..."
    
    # Remove test scripts
    local test_scripts=(
        "blackbox-test-suite.js"
        "test-all-apis.js"
        "test-all-notifications.js"
        "test-api-notifications.js"
        "test-crud-simple.js"
        "test-event-notification.js"
        "test-event-simple.js"
        "test-notification-isolation.js"
        "test-notification-role-filtering.js"
        "test-notification-simple.js"
        "test-system-notifications.js"
        "notification-test-summary.js"
        "create-test-notifications.js"
    )
    
    for file in "${test_scripts[@]}"; do
        if [ -f "$file" ]; then
            echo "  Removing: $file"
            rm "$file"
            ((removed_count++))
        fi
    done
    
    # Remove test shell scripts
    for file in test-*.sh; do
        if [ -f "$file" ] && [[ "$file" != "test-telegram-bot-complete.sh" ]]; then
            echo "  Removing: $file"
            rm "$file"
            ((removed_count++))
        fi
    done
    
    print_step "Removing development utility scripts..."
    
    # Remove development utilities
    local dev_scripts=(
        "check-chunks-status.sh"
        "clear-notifications.sh"
        "clear-notifications-only.sh"
        "clear-session-and-test.sh"
        "comprehensive-api-test.sh"
        "demo-telegram-bot.sh"
        "demo-telegram-bot-complete.sh"
        "emergency-recovery.sh"
        "fix-chunks-404.sh"
        "fix-session-mismatch.sh"
        "force-logout-clear-session.sh"
        "monitor-system-health.sh"
        "nuclear-restart.sh"
        "project-cleanup-final.sh"
        "quick-api-test.sh"
        "quick-reset-db.sh"
        "run-blackbox-tests.sh"
        "setup-notification-test.sh"
        "setup-test-users.sh"
        "test-chunks-404.sh"
        "test-new-users-after-reset.sh"
        "test-nuclear-config.sh"
        "validate-system.sh"
        "verify-final-status.sh"
        "verify-jwt-fix.sh"
        "verify-jwt-fix-macos.sh"
        "verify-system.sh"
        "verify-telegram-bot.sh"
    )
    
    for file in "${dev_scripts[@]}"; do
        if [ -f "$file" ]; then
            echo "  Removing: $file"
            rm "$file"
            ((removed_count++))
        fi
    done
    
    print_step "Removing telegram enhancement scripts (keep core setup)..."
    
    # Remove telegram enhancement scripts but keep essential ones
    local telegram_cleanup=(
        "telegram-enhancement-summary.sh"
        "telegram-ux-enhancement.sh"
    )
    
    for file in "${telegram_cleanup[@]}"; do
        if [ -f "$file" ]; then
            echo "  Removing: $file"
            rm "$file"
            ((removed_count++))
        fi
    done
    
    echo ""
    print_success "Cleanup completed! Removed $removed_count files."
    
    return $removed_count
}

# Show what will be removed
total_files=$(count_files)

echo "Files to be removed: $total_files"
echo ""

print_info "This will remove:"
echo "• Development documentation files (*_COMPLETE.md, *_SUCCESS.md, etc.)"
echo "• Log files (*.log)"
echo "• Test scripts and utilities"
echo "• Development debugging scripts"
echo "• Temporary enhancement scripts"
echo ""

print_info "This will KEEP:"
echo "• Core application files (frontend/, backend/)"
echo "• Docker configuration (docker-compose.yml, nginx.conf)"
echo "• Essential scripts (start-app.sh, deploy-docker.sh, fast-dev.sh)"
echo "• Main documentation (README.md)"
echo "• Core Telegram setup (CREATE_TELEGRAM_BOT.md, activate-telegram-bot.sh)"
echo "• Environment files (.env, .env.docker)"
echo ""

read -p "Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    cleanup_files
    removed=$?
    
    echo ""
    print_success "🎉 Cleanup completed successfully!"
    print_info "Removed $removed unused files"
    print_info "Your application core files are preserved"
    
    echo ""
    print_info "Files still available for production:"
    echo "• Application: frontend/, backend/"
    echo "• Configuration: docker-compose.yml, nginx.conf, package.json"
    echo "• Documentation: README.md, CREATE_TELEGRAM_BOT.md"
    echo "• Essential scripts: start-app.sh, deploy-docker.sh, fast-dev.sh"
    echo "• Telegram setup: activate-telegram-bot.sh, setup-telegram-bot.sh"
    echo ""
    
else
    print_info "Cleanup cancelled. No files were removed."
fi

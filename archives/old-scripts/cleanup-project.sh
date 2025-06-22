#!/bin/zsh

# Project Cleanup Script - Remove Unused Files
# This script removes all test files, mock servers, and other unused development files

echo "🧹 Starting project cleanup..."

# Root directory files to remove (test and documentation files)
ROOT_FILES_TO_REMOVE=(
    "aturan-tukar-shift.md"
    "check-api-url.sh"
    "dropdown-fix-summary.md"
    "fixes-summary.md"
    "hide-admin-role.md"
    "mobile-access-qr.sh"
    "setup-network-access.sh"
    "show-ip.sh"
    "simple-api-test.html"
    "start-mock-server.sh"
    "start-network.sh"
    "start-servers.sh"
    "stop-servers.sh"
    "test-api-connection.html"
    "test-api-connection.sh"
    "test-integration.sh"
    "test-login.html"
    "test-login.js"
    "test-shift-swap-api.html"
    "test-shift-swap-api.js"
    "test-shift-swap-complete.sh"
    "test-shifts-api.sh"
    "test-simple-server.sh"
    "url-format-fixes.md"
    "verify-fixes.sh"
    "SHIFT_SWAP_IMPLEMENTATION_COMPLETE.md"
    ".DS_Store"
)

# Backend files to remove (mock servers and unused files)
BACKEND_FILES_TO_REMOVE=(
    "mock-api-server.js"
    "mock-api-server-improved.js"
    "mock-api-server-fixed.js"
    "simple-mock-server.js"
    "start-mock-server.js"
    "start-mock-server.sh"
    ".DS_Store"
)

# Frontend public files to remove (mock JSON files and test HTML)
FRONTEND_PUBLIC_FILES_TO_REMOVE=(
    "mock-events.json"
    "mock-login.json"
    "mock-shifts.json"
    "mock-users.json"
    "test-auth-setup.html"
    "test-login.html"
    "test-user-setup.html"
)

# Frontend src files to remove (unused components and duplicates)
FRONTEND_SRC_FILES_TO_REMOVE=(
    "src/component/FormModal 2.tsx"
    "src/component/FormModal.tsx.tsx"
    "src/test-import.tsx"
    "src/pages/api/user/profile.ts"
)

# Change to project root
cd "/Users/jo/Documents/Backup 2/Thesis"

echo "📂 Cleaning root directory..."
for file in $ROOT_FILES_TO_REMOVE; do
    if [[ -f "$file" ]]; then
        echo "  ❌ Removing: $file"
        rm "$file"
    fi
done

echo "📂 Cleaning backend directory..."
cd backend
for file in $BACKEND_FILES_TO_REMOVE; do
    if [[ -f "$file" ]]; then
        echo "  ❌ Removing: backend/$file"
        rm "$file"
    fi
done

echo "📂 Cleaning frontend/public directory..."
cd ../frontend/public
for file in $FRONTEND_PUBLIC_FILES_TO_REMOVE; do
    if [[ -f "$file" ]]; then
        echo "  ❌ Removing: frontend/public/$file"
        rm "$file"
    fi
done

echo "📂 Cleaning frontend/src directory..."
cd ..
for file in $FRONTEND_SRC_FILES_TO_REMOVE; do
    if [[ -f "$file" ]]; then
        echo "  ❌ Removing: frontend/$file"
        rm "$file"
    fi
done

# Remove any additional .DS_Store files
echo "📂 Removing all .DS_Store files..."
find . -name ".DS_Store" -type f -delete

# Remove node_modules cache and lockfiles to clean up dependencies
echo "📂 Cleaning dependency caches..."
if [[ -d "node_modules" ]]; then
    echo "  🗑️  Removing frontend/node_modules"
    rm -rf node_modules
fi

if [[ -d "../backend/node_modules" ]]; then
    echo "  🗑️  Removing backend/node_modules"
    rm -rf ../backend/node_modules
fi

# Remove .next cache
if [[ -d ".next" ]]; then
    echo "  🗑️  Removing .next cache"
    rm -rf .next
fi

# Remove dist folder from backend
if [[ -d "../backend/dist" ]]; then
    echo "  🗑️  Removing backend/dist"
    rm -rf ../backend/dist
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Summary of removed files:"
echo "   • All test files and scripts"
echo "   • Mock API servers (3 versions)"
echo "   • Mock JSON data files"
echo "   • Duplicate components"
echo "   • Documentation files for completed features"
echo "   • System files (.DS_Store)"
echo "   • Build caches (node_modules, .next, dist)"
echo ""
echo "🔄 Next steps:"
echo "   1. Run 'npm install' in both frontend and backend directories"
echo "   2. Run 'npm run dev' to start the optimized development server"
echo ""
echo "💡 The project is now clean and optimized for development!"

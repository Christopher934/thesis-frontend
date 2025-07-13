#!/bin/bash

# Comprehensive cleanup script for the Thesis project
# This script removes all unused files while keeping essential project files

echo "🧹 Starting comprehensive cleanup of unused files..."

# Navigate to the project root
cd /Users/jo/Downloads/Thesis

# Files to keep (essential project files)
echo "📋 Keeping essential files:"
echo "  - .env, .env.docker, .gitignore"
echo "  - package.json, package-lock.json"
echo "  - README.md (main documentation)"
echo "  - docker-compose.yml (main docker config)"
echo "  - nginx.conf"
echo "  - backend/ and frontend/ directories"
echo "  - database-structure-improvements.sql"
echo "  - NODE_MODULES (if needed)"

# Remove all markdown documentation files except README.md
echo "🗑️  Removing unused documentation files..."
rm -f *.md
# Keep only README.md
git checkout HEAD -- README.md 2>/dev/null || echo "README.md will be recreated"

# Remove all shell scripts except essential ones
echo "🗑️  Removing unused shell scripts..."
rm -f *.sh
# Keep only essential scripts
cat > start-system.sh << 'EOF'
#!/bin/bash
# Essential system start script
echo "Starting Thesis Hospital Management System..."
echo "Starting Backend..."
cd backend && npm run start:dev &
echo "Starting Frontend..."
cd ../frontend && npm run dev &
echo "System started! Backend: http://localhost:3001, Frontend: http://localhost:3000"
EOF

chmod +x start-system.sh

# Remove all JavaScript test files
echo "🗑️  Removing test files..."
rm -f test-*.js
rm -f *-test.js
rm -f activate-telegram-bot.js
rm -f telegram-bot-demo.js

# Remove all duplicate docker-compose files except the main one
echo "🗑️  Removing duplicate docker configurations..."
rm -f docker-compose.*.yml
# Keep only the main docker-compose.yml

# Remove frontend backup
echo "🗑️  Removing frontend backup..."
rm -rf frontend_backup/

# Clean up any temporary files
echo "🗑️  Removing temporary files..."
rm -f *.log
rm -f *.tmp
rm -f file.sh

echo "✅ Cleanup completed!"
echo ""
echo "📁 Remaining essential files:"
ls -la | grep -E '\.(md|yml|json|sql|conf|env|sh)$|^d' | head -20
echo ""
echo "💾 Project structure after cleanup:"
echo "├── backend/          # Backend NestJS application"
echo "├── frontend/         # Frontend Next.js application"
echo "├── .env             # Environment variables"
echo "├── .env.docker      # Docker environment"
echo "├── .gitignore       # Git ignore rules"
echo "├── docker-compose.yml # Docker configuration"
echo "├── nginx.conf       # Nginx configuration"
echo "├── package.json     # Root package.json"
echo "├── README.md        # Main documentation"
echo "├── start-system.sh  # System start script"
echo "└── database-structure-improvements.sql # Database schema"
echo ""
echo "🎯 Ready for development! Use ./start-system.sh to start the application."

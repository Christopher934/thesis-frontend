#!/bin/bash

# 🚀 QUICK DATABASE RESET (NO CONFIRMATION)
# For development use - resets database quickly

echo "🚀 QUICK DATABASE RESET - Development Mode"
echo "=========================================="

cd /Users/jo/Documents/Backup_2/Thesis/backend

echo "🗑️  Resetting database (forced)..."
npx prisma migrate reset --force --skip-seed

echo "📝 Generating Prisma client..."
npx prisma generate

echo "🌱 Seeding database..."
if [ -f "prisma/seed.ts" ]; then
    npx prisma db seed
else
    echo "⚠️  No seed file found - skipping seeding"
fi

echo ""
echo "✅ Quick reset completed!"
echo "🔧 Restart your server and test the application"

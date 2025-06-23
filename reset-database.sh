#!/bin/bash

# 🗄️ DATABASE RESET SCRIPT
# This script completely resets the database to a clean state

echo "🗄️ ==========================================="
echo "🗄️ DATABASE RESET SCRIPT"
echo "🗄️ ==========================================="

# Navigate to backend directory
cd /Users/jo/Documents/Backup_2/Thesis/backend

echo ""
echo "📍 Current directory: $(pwd)"
echo ""

# Check if Prisma is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

# Step 1: Reset the database (this will drop all data and recreate schema)
echo "🔄 Step 1: Resetting database schema..."
echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo "🗑️  Resetting database..."
npx prisma migrate reset --force

if [ $? -ne 0 ]; then
    echo "❌ Database reset failed!"
    exit 1
fi

echo "✅ Database reset completed!"

# Step 2: Apply latest migrations
echo ""
echo "🔄 Step 2: Applying migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations applied successfully!"

# Step 3: Generate Prisma client
echo ""
echo "🔄 Step 3: Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed!"
    exit 1
fi

echo "✅ Prisma client generated successfully!"

# Step 4: Seed the database
echo ""
echo "🔄 Step 4: Seeding database with initial data..."

# Check if seed script exists
if [ -f "prisma/seed.ts" ]; then
    npx prisma db seed
    
    if [ $? -ne 0 ]; then
        echo "❌ Database seeding failed!"
        exit 1
    fi
    
    echo "✅ Database seeded successfully!"
else
    echo "⚠️  No seed script found at prisma/seed.ts"
    echo "ℹ️  Database reset completed but no initial data seeded."
fi

# Step 5: Verify database status
echo ""
echo "🔄 Step 5: Verifying database status..."
npx prisma db status

echo ""
echo "🎉 =========================================="
echo "🎉 DATABASE RESET COMPLETED SUCCESSFULLY!"
echo "🎉 =========================================="
echo ""
echo "📊 Database Status:"
echo "   - Schema: ✅ Reset and up-to-date"
echo "   - Migrations: ✅ Applied"
echo "   - Client: ✅ Generated"
echo "   - Seed Data: ✅ Loaded (if available)"
echo ""
echo "🔧 Next Steps:"
echo "   1. Restart your backend server"
echo "   2. Test your application"
echo "   3. Create test users if needed"
echo ""
echo "💡 Useful Commands:"
echo "   - View database: npx prisma studio"
echo "   - Check migrations: npx prisma migrate status"
echo "   - Generate client: npx prisma generate"

#!/bin/bash

# 🔔 CLEAR NOTIFICATIONS SCRIPT
# This script removes all notifications from the database without affecting other data

echo "🔔 =================================="
echo "🔔 CLEAR NOTIFICATIONS SCRIPT"
echo "🔔 =================================="

cd /Users/jo/Documents/Backup_2/Thesis/backend

# Create a simple SQL script to clear notifications
echo "🗑️  Clearing all notifications..."

# Using Prisma client to clear notifications
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearNotifications() {
  try {
    const result = await prisma.notifikasi.deleteMany({});
    console.log(\`✅ Deleted \${result.count} notifications\`);
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

clearNotifications();
"

echo ""
echo "✅ Notifications cleared successfully!"
echo "🔧 Your other data (users, shifts, etc.) remains intact"

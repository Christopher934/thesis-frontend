const { PrismaClient } = require('@prisma/client');

async function checkAdminUsers() {
  const prisma = new PrismaClient();
  try {
    // Check admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, username: true, email: true, role: true }
    });
    
    console.log('Admin users found:', adminUsers);
    
    // Also check total users count
    const totalUsers = await prisma.user.count();
    console.log('Total users in database:', totalUsers);
    
    // Check if there are any users at all
    if (totalUsers === 0) {
      console.log('Database is empty! No users found.');
      return;
    }
    
    // Check first 5 users
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: { id: true, username: true, email: true, role: true }
    });
    
    console.log('Sample users:', sampleUsers);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();

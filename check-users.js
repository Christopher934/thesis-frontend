const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        username: true,
        role: true,
        email: true,
      }
    });
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Employee ID: ${user.employeeId}, Username: ${user.username}, Role: ${user.role}, Email: ${user.email}`);
    });
    
    console.log(`\nTotal users: ${users.length}`);
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

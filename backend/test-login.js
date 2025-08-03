const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
  console.log('🔍 Testing admin login process...');
  
  try {
    // 1. Check if admin user exists
    const user = await prisma.user.findUnique({
      where: { email: 'admin@rsud.id' }
    });
    
    if (!user) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });
    
    // 2. Test password comparison
    const password = 'password123';
    const match = await bcrypt.compare(password, user.password);
    
    console.log('💾 Stored password hash:', user.password.substring(0, 20) + '...');
    console.log('🔐 Password match result:', match);
    
    if (match) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password does not match');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

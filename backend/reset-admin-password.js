const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔄 Resetting admin password...');
  
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updated = await prisma.user.update({
      where: { email: 'admin@rsud.id' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password updated successfully');
    console.log('🔑 New password:', newPassword);
    
    // Test the new password
    const match = await bcrypt.compare(newPassword, hashedPassword);
    console.log('🔐 Password verification:', match);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

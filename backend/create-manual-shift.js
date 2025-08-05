// Manual shift creation script using Prisma directly
// Run this from backend directory: node create-manual-shift.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createShift() {
    try {
        console.log('Creating shift directly in database...');

        // First, let's check available users
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                username: true,
                namaDepan: true,
                namaBelakang: true,
                role: true
            }
        });

        console.log('Available users:');
        users.forEach(user => {
            console.log(`- ${user.username} (${user.namaDepan} ${user.namaBelakang}) - ${user.role}`);
        });

        // Pick the first user
        const selectedUser = users[0];
        console.log(`\nCreating shift for: ${selectedUser.username} (${selectedUser.namaDepan} ${selectedUser.namaBelakang})`);

        // Create shift data
        const shiftData = {
            tanggal: new Date('2025-08-07T00:00:00.000Z'),
            jammulai: new Date('1970-01-01T07:00:00.000Z'), // Time only - use epoch date
            jamselesai: new Date('1970-01-01T15:00:00.000Z'), // Time only - use epoch date
            lokasishift: 'RAWAT_INAP',
            tipeshift: 'PAGI',
            userId: selectedUser.id,
            isAutoAssigned: false,
            priority: 'NORMAL',
            difficulty: 'STANDARD'
        };

        console.log('Shift data to create:', JSON.stringify(shiftData, null, 2));

        // Create the shift
        const createdShift = await prisma.shift.create({
            data: shiftData
        });

        console.log('✅ Shift berhasil dibuat!');
        console.log('Created shift:', JSON.stringify(createdShift, null, 2));

        // Verify by getting all shifts
        const allShifts = await prisma.shift.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        namaDepan: true,
                        namaBelakang: true,
                        role: true
                    }
                }
            }
        });

        console.log(`\nTotal shifts in database: ${allShifts.length}`);
        allShifts.forEach(shift => {
            console.log(`- ${shift.tanggal.toISOString().split('T')[0]} | ${shift.user?.namaDepan} ${shift.user?.namaBelakang} | ${shift.jammulai}-${shift.jamselesai} | ${shift.lokasishift} | ${shift.tipeshift}`);
        });

    } catch (error) {
        console.error('❌ Error creating shift:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createShift();

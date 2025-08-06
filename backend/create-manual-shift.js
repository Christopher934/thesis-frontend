// Skrip pembuatan shift manual menggunakan Prisma langsung
// Jalankan dari direktori backend: node create-manual-shift.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createShift() {
    try {
        console.log('Membuat shift langsung di basis data...');

        // Pertama, mari periksa pegawai yang tersedia
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

        console.log('Pegawai yang tersedia:');
        users.forEach(user => {
            console.log(`- ${user.username} (${user.namaDepan} ${user.namaBelakang}) - ${user.role}`);
        });

        // Pilih pegawai pertama
        const selectedUser = users[0];
        console.log(`\nMembuat shift untuk: ${selectedUser.username} (${selectedUser.namaDepan} ${selectedUser.namaBelakang})`);

        // Buat data shift
        const shiftData = {
            tanggal: new Date('2025-08-07T00:00:00.000Z'),
            jammulai: new Date('1970-01-01T07:00:00.000Z'), // Waktu saja - gunakan tanggal epoch
            jamselesai: new Date('1970-01-01T15:00:00.000Z'), // Waktu saja - gunakan tanggal epoch
            lokasishift: 'RAWAT_INAP',
            tipeshift: 'PAGI',
            userId: selectedUser.id,
            isAutoAssigned: false,
            priority: 'NORMAL',
            difficulty: 'STANDARD'
        };

        console.log('Data shift yang akan dibuat:', JSON.stringify(shiftData, null, 2));

        // Buat shift
        const createdShift = await prisma.shift.create({
            data: shiftData
        });

        console.log('✅ Shift berhasil dibuat!');
        console.log('Shift yang dibuat:', JSON.stringify(createdShift, null, 2));

        // Verifikasi dengan mengambil semua shift
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

        console.log(`\nTotal shift dalam basis data: ${allShifts.length}`);
        allShifts.forEach(shift => {
            console.log(`- ${shift.tanggal.toISOString().split('T')[0]} | ${shift.user?.namaDepan} ${shift.user?.namaBelakang} | ${shift.jammulai}-${shift.jamselesai} | ${shift.lokasishift} | ${shift.tipeshift}`);
        });

    } catch (error) {
        console.error('❌ Kesalahan dalam membuat shift:', error.message);
        console.error('Kesalahan lengkap:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createShift();

import { PrismaClient, JenisNotifikasi } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding notifications...');

  // Ambil beberapa user berdasarkan role
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  const supervisor = await prisma.user.findFirst({
    where: { role: 'SUPERVISOR' }
  });

  const staff = await prisma.user.findFirst({
    where: { 
      role: { 
        in: ['PERAWAT', 'DOKTER'] 
      } 
    }
  });

  if (!admin || !supervisor || !staff) {
    console.error('❌ Required users not found. Please ensure you have ADMIN, SUPERVISOR, and PERAWAT/DOKTER users in your database.');
    return;
  }

  console.log(`📋 Found users:
  - Admin: ${admin.namaDepan} ${admin.namaBelakang} (ID: ${admin.id})
  - Supervisor: ${supervisor.namaDepan} ${supervisor.namaBelakang} (ID: ${supervisor.id})
  - Staff: ${staff.namaDepan} ${staff.namaBelakang} (ID: ${staff.id}, Role: ${staff.role})`);

  // Data notifikasi dummy menggunakan model Notifikasi yang sudah ada
  const notifications = [
    // 2 notifikasi untuk admin
    {
      userId: admin.id,
      judul: 'System Maintenance Scheduled',
      pesan: 'Sistem akan menjalani maintenance rutin pada hari Minggu, 25 Juni 2025 pukul 02:00-04:00 WIB. Harap simpan pekerjaan Anda sebelum waktu tersebut.',
      jenis: 'SISTEM_INFO' as JenisNotifikasi,
      data: {
        maintenanceDate: '2025-06-25T02:00:00Z',
        duration: '2 hours',
        affectedServices: ['Database', 'API Server', 'File Storage']
      }
    },
    {
      userId: admin.id,
      judul: 'New User Registration Approval',
      pesan: 'Terdapat 3 pendaftaran pengguna baru yang memerlukan persetujuan. Silakan review dan approve pendaftaran tersebut.',
      jenis: 'PERSETUJUAN_CUTI' as JenisNotifikasi,
      data: {
        pendingCount: 3,
        pendingUsers: ['dr_smith', 'nurse_jane', 'admin_bob']
      }
    },

    // 2 notifikasi untuk supervisor
    {
      userId: supervisor.id,
      judul: 'Shift Change Request Approval',
      pesan: 'Perawat Sarah mengajukan pertukaran shift untuk tanggal 24 Juni 2025. Shift pagi (07:00-15:00) ingin ditukar dengan shift malam (23:00-07:00).',
      jenis: 'PERSETUJUAN_CUTI' as JenisNotifikasi,
      data: {
        requesterId: staff.id,
        originalShift: 'Morning (07:00-15:00)',
        requestedShift: 'Night (23:00-07:00)',
        date: '2025-06-24',
        reason: 'Personal appointment'
      }
    },
    {
      userId: supervisor.id,
      judul: 'Monthly Staff Meeting',
      pesan: 'Rapat bulanan staf akan diadakan pada hari Jumat, 28 Juni 2025 pukul 14:00 WIB di ruang rapat lantai 2. Agenda: evaluasi kinerja dan planning bulan depan.',
      jenis: 'KEGIATAN_HARIAN' as JenisNotifikasi,
      data: {
        eventDate: '2025-06-28T14:00:00Z',
        location: 'Ruang Rapat Lantai 2',
        duration: '2 hours',
        agenda: ['Evaluasi Kinerja', 'Planning Bulan Depan', 'Update Kebijakan']
      }
    },

    // 1 notifikasi untuk staff
    {
      userId: staff.id,
      judul: 'Shift Reminder Tomorrow',
      pesan: 'Pengingat: Anda memiliki shift besok, 24 Juni 2025 pukul 07:00-15:00 WIB di Ruang IGD. Harap datang 15 menit lebih awal untuk handover.',
      jenis: 'REMINDER_SHIFT' as JenisNotifikasi,
      data: {
        shiftDate: '2025-06-24',
        shiftTime: '07:00-15:00',
        location: 'Ruang IGD',
        reminderType: 'next_day',
        handoverTime: '06:45'
      }
    }
  ];

  // Insert notifikasi ke database
  try {
    const result = await prisma.notifikasi.createMany({
      data: notifications
    });

    console.log(`✅ Successfully created ${result.count} notifications`);

    // Tampilkan summary
    const adminNotifications = await prisma.notifikasi.count({
      where: { userId: admin.id }
    });
    
    const supervisorNotifications = await prisma.notifikasi.count({
      where: { userId: supervisor.id }
    });
    
    const staffNotifications = await prisma.notifikasi.count({
      where: { userId: staff.id }
    });

    console.log(`📊 Notification Summary:
  - Admin: ${adminNotifications} notifications
  - Supervisor: ${supervisorNotifications} notifications  
  - Staff (${staff.role}): ${staffNotifications} notifications`);

    // Tampilkan breakdown per type
    const notificationsByType = await prisma.notifikasi.groupBy({
      by: ['jenis'],
      _count: {
        jenis: true
      }
    });

    console.log('\n📈 Notifications by type:');
    notificationsByType.forEach(({ jenis, _count }) => {
      console.log(`  - ${jenis}: ${_count.jenis} notifications`);
    });

  } catch (error) {
    console.error('❌ Error creating notifications:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });

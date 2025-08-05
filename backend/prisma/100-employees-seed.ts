import { PrismaClient, Role, Gender, LokasiShift, TipeShift } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate Indonesian names
const namaDepan = [
  'Siti', 'Ahmad', 'Budi', 'Rina', 'Dedi', 'Maya', 'Andi', 'Sari', 'Joko', 'Dewi',
  'Rudi', 'Indira', 'Hendra', 'Fitri', 'Bambang', 'Lestari', 'Agus', 'Wulan', 'Eko', 'Ratna',
  'Dimas', 'Yuni', 'Fajar', 'Sri', 'Tono', 'Dwi', 'Bayu', 'Ika', 'Reza', 'Nurul',
  'Hadi', 'Ani', 'Gunawan', 'Putri', 'Surya', 'Dian', 'Rizki', 'Mega', 'Ivan', 'Sinta',
  'Wahyu', 'Lina', 'Bobby', 'Tuti', 'Dono', 'Mira', 'Yoga', 'Lely', 'Dani', 'Nana'
];

const namaBelakang = [
  'Sari', 'Wati', 'Pratama', 'Utomo', 'Susanto', 'Maharani', 'Santoso', 'Widodo',
  'Kusuma', 'Handayani', 'Setiawan', 'Rahayu', 'Wijaya', 'Lestari', 'Permana', 'Sari',
  'Nugraha', 'Cahaya', 'Saputra', 'Dewi', 'Putra', 'Indah', 'Kurnia', 'Safitri',
  'Hidayat', 'Anggraini', 'Ramadhan', 'Kartika', 'Firmansyah', 'Melati', 'Gunawan', 'Puspita',
  'Wibowo', 'Damayanti', 'Suryana', 'Permatasari', 'Pranata', 'Maharani', 'Saputri', 'Fajar'
];

// Generate random date within last 5 years for birth date
function getRandomBirthDate(): Date {
  const start = new Date('1970-01-01');
  const end = new Date('2000-12-31');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Get random address
const alamatList = [
  'Jl. Merdeka No. 15, Jakarta Pusat',
  'Jl. Sudirman No. 88, Jakarta Selatan', 
  'Jl. Gatot Subroto No. 45, Jakarta Selatan',
  'Jl. Thamrin No. 23, Jakarta Pusat',
  'Jl. Kuningan No. 67, Jakarta Selatan',
  'Jl. Senayan No. 12, Jakarta Pusat',
  'Jl. Kemang No. 34, Jakarta Selatan',
  'Jl. Menteng No. 56, Jakarta Pusat',
  'Jl. Kebayoran No. 78, Jakarta Selatan',
  'Jl. Cikini No. 90, Jakarta Pusat'
];

// Role distribution (realistic for hospital)
const roleDistribution = [
  { role: Role.PERAWAT, count: 50 }, // 50% nurses
  { role: Role.DOKTER, count: 20 },  // 20% doctors  
  { role: Role.STAF, count: 20 },    // 20% staff
  { role: Role.SUPERVISOR, count: 8 }, // 8% supervisors
  { role: Role.ADMIN, count: 2 }     // 2% admin
];

// Location preferences by role
const locationByRole = {
  [Role.PERAWAT]: [LokasiShift.RAWAT_INAP, LokasiShift.ICU, LokasiShift.NICU, LokasiShift.GAWAT_DARURAT],
  [Role.DOKTER]: [LokasiShift.RAWAT_JALAN, LokasiShift.RAWAT_INAP, LokasiShift.GAWAT_DARURAT, LokasiShift.ICU],
  [Role.STAF]: [LokasiShift.GEDUNG_ADMINISTRASI, LokasiShift.LABORATORIUM, LokasiShift.FARMASI, LokasiShift.RADIOLOGI],
  [Role.SUPERVISOR]: [LokasiShift.GEDUNG_ADMINISTRASI, LokasiShift.RAWAT_INAP, LokasiShift.GAWAT_DARURAT],
  [Role.ADMIN]: [LokasiShift.GEDUNG_ADMINISTRASI]
};

// Shift time patterns
const shiftPatterns = [
  { tipe: TipeShift.PAGI, jamMulai: '07:00', jamSelesai: '15:00' },
  { tipe: TipeShift.SIANG, jamMulai: '15:00', jamSelesai: '23:00' },
  { tipe: TipeShift.MALAM, jamMulai: '23:00', jamSelesai: '07:00' },
  { tipe: TipeShift.ON_CALL, jamMulai: '08:00', jamSelesai: '17:00' },
  { tipe: TipeShift.JAGA, jamMulai: '17:00', jamSelesai: '08:00' }
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate shifts for next 30 days
function generateShiftsForUser(userId: number, role: Role): any[] {
  const shifts: any[] = [];
  const today = new Date();
  const locations = locationByRole[role];
  
  // Some users have more shifts (overworked), some have fewer (underworked)
  const shiftCounts = [
    { count: 25, probability: 0.2 }, // Overworked - 25 shifts in 30 days
    { count: 20, probability: 0.3 }, // High workload - 20 shifts
    { count: 15, probability: 0.3 }, // Normal - 15 shifts  
    { count: 10, probability: 0.15 }, // Light - 10 shifts
    { count: 5, probability: 0.05 }   // Very light - 5 shifts
  ];
  
  // Select shift count based on probability
  let randomNum = Math.random();
  let selectedCount = 15; // default
  
  for (const sc of shiftCounts) {
    if (randomNum < sc.probability) {
      selectedCount = sc.count;
      break;
    }
    randomNum -= sc.probability;
  }
  
  // Generate random dates within next 30 days
  const selectedDates: Date[] = [];
  for (let i = 0; i < selectedCount; i++) {
    const randomDays = Math.floor(Math.random() * 30);
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + randomDays);
    selectedDates.push(shiftDate);
  }
  
  // Remove duplicates and sort
  const uniqueDates = [...new Set(selectedDates.map(d => d.toDateString()))]
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, selectedCount);
  
  for (const date of uniqueDates) {
    const pattern = getRandomElement(shiftPatterns);
    const location = getRandomElement(locations);
    
    // Create time objects
    const [startHour, startMin] = pattern.jamMulai.split(':').map(Number);
    const [endHour, endMin] = pattern.jamSelesai.split(':').map(Number);
    
    const jamMulai = new Date();
    jamMulai.setHours(startHour, startMin, 0, 0);
    
    const jamSelesai = new Date();
    jamSelesai.setHours(endHour, endMin, 0, 0);
    
    shifts.push({
      tanggal: date,
      jammulai: jamMulai,
      jamselesai: jamSelesai,
      lokasishift: location,
      lokasiEnum: location,
      userId: userId,
    });
  }
  
  return shifts;
}

async function main() {
  console.log('🚀 Starting to seed 100 employees with shifts...');
  
  // Clear existing data in proper order (respecting foreign keys)
  console.log('🧹 Cleaning existing data...');
  await prisma.absensi.deleteMany({});
  await prisma.shiftSwap.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.notifikasi.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.loginLog.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Database cleaned successfully');
  
  const users: any[] = [];
  let employeeCounter = 1;
  
  // Generate users based on role distribution
  for (const { role, count } of roleDistribution) {
    for (let i = 0; i < count; i++) {
      const firstName = getRandomElement(namaDepan);
      const lastName = getRandomElement(namaBelakang);
      const gender = Math.random() > 0.5 ? Gender.P : Gender.L;
      
      const user = {
        employeeId: `EMP${employeeCounter.toString().padStart(3, '0')}`,
        username: `${firstName.toLowerCase()}${employeeCounter}`,
        email: `${firstName.toLowerCase()}${employeeCounter}@hospital.com`,
        password: await bcrypt.hash('password123', 10),
        namaDepan: firstName,
        namaBelakang: lastName,
        alamat: getRandomElement(alamatList),
        noHp: `08${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        jenisKelamin: gender,
        tanggalLahir: getRandomBirthDate(),
        role: role,
      };
      
      users.push(user);
      employeeCounter++;
    }
  }
  
  console.log(`📝 Creating ${users.length} users...`);
  
  // Insert users in batches
  const batchSize = 10;
  const createdUsers: any[] = [];
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const created = await Promise.all(
      batch.map(user => prisma.user.create({ data: user }))
    );
    createdUsers.push(...created);
    console.log(`✅ Created users ${i + 1}-${Math.min(i + batchSize, users.length)}`);
  }
  
  console.log('📅 Generating shifts for all users...');
  
  // Generate shifts for each user
  const allShifts: any[] = [];
  for (const user of createdUsers) {
    const userShifts = generateShiftsForUser(user.id, user.role);
    allShifts.push(...userShifts);
  }
  
  console.log(`📊 Creating ${allShifts.length} shifts...`);
  
  // Insert shifts in batches
  for (let i = 0; i < allShifts.length; i += batchSize) {
    const batch = allShifts.slice(i, i + batchSize);
    await prisma.shift.createMany({ data: batch });
    console.log(`✅ Created shifts ${i + 1}-${Math.min(i + batchSize, allShifts.length)}`);
  }
  
  // Generate statistics
  const stats = await prisma.$transaction([
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      orderBy: { role: 'asc' }
    }),
    prisma.shift.groupBy({
      by: ['lokasiEnum'],
      _count: { id: true },
      orderBy: { lokasiEnum: 'asc' }
    })
  ]);
  
  console.log('\n📊 SEEDING COMPLETED!');
  console.log('='.repeat(50));
  console.log('👥 USER DISTRIBUTION BY ROLE:');
  stats[0].forEach(stat => {
    console.log(`   ${stat.role}: ${(stat._count as any).id} users`);
  });
  
  console.log('\n📍 SHIFT DISTRIBUTION BY LOCATION:');
  stats[1].forEach(stat => {
    console.log(`   ${stat.lokasiEnum}: ${(stat._count as any).id} shifts`);
  });
  
  // Show workload distribution
  const workloadStats = await prisma.$queryRaw`
    SELECT 
      u.role,
      u."namaDepan" || ' ' || u."namaBelakang" as name,
      COUNT(s.id) as shift_count,
      CASE 
        WHEN COUNT(s.id) >= 20 THEN 'OVERWORKED'
        WHEN COUNT(s.id) >= 15 THEN 'HIGH'
        WHEN COUNT(s.id) >= 10 THEN 'NORMAL'
        WHEN COUNT(s.id) >= 5 THEN 'LIGHT'
        ELSE 'VERY_LIGHT'
      END as workload_category
    FROM users u
    LEFT JOIN shifts s ON u.id = s."userId"
    GROUP BY u.id, u.role, u."namaDepan", u."namaBelakang"
    ORDER BY shift_count DESC
    LIMIT 20
  `;
  
  console.log('\n⚖️ TOP 20 EMPLOYEES BY WORKLOAD:');
  (workloadStats as any[]).forEach((stat, index) => {
    console.log(`   ${index + 1}. ${stat.name} (${stat.role}): ${stat.shift_count} shifts - ${stat.workload_category}`);
  });
  
  console.log('\n🎯 SMART SWAP SYSTEM READY FOR TESTING!');
  console.log('✅ Data includes employees with varying workloads');
  console.log('✅ Multiple roles and locations for compatibility testing');
  console.log('✅ Realistic shift patterns for next 30 days');
  
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

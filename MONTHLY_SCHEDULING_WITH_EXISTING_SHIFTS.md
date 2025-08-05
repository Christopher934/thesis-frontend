# Penjadwalan Bulanan dengan Jadwal Existing

## Situasi yang Dijelaskan User

Kamu sudah membuat jadwal mingguan untuk minggu pertama dan kedua bulan Agustus 2025.
Lalu kamu ingin membuat jadwal bulanan untuk Agustus 2025 dengan batasan:

- Max Shift per Orang = 10
- Max Hari Berturut-turut = 2

## Apa yang Harus Terjadi ✅

### 1. **Deteksi Jadwal Existing**

```typescript
// Sistem harus query database untuk jadwal existing di bulan tersebut
const existingShifts = await this.getExistingShiftsInMonth(year, month);
const existingDates = new Set(
  existingShifts.map((shift) => shift.tanggal.toISOString().split("T")[0])
);
```

**Hasil yang Diharapkan:**

- Sistem mendeteksi ada jadwal untuk tanggal 1-7 Agustus (minggu 1) dan 8-14 Agustus (minggu 2)
- Sistem akan SKIP tanggal-tanggal tersebut saat membuat jadwal bulanan
- Sistem hanya akan membuat jadwal untuk tanggal 15-31 Agustus

### 2. **Kalkulasi Beban Kerja Existing**

```typescript
// Initialize user workload dari jadwal existing
const userShiftCounts = await this.initializeUserShiftCountsFromExisting(
  year,
  month
);
```

**Contoh Output:**

```
👥 User shift counts dari jadwal existing:
- User 1: 6 shifts (4 slots remaining dari max 10)
- User 2: 8 shifts (2 slots remaining dari max 10)
- User 3: 4 shifts (6 slots remaining dari max 10)
- User 4: 10 shifts (0 slots remaining - FULL)
```

### 3. **Validasi Enhanced dengan Consecutive Days**

```typescript
// Untuk setiap assignment baru, validasi:
const validation = await this.validateWorkloadWithExistingShifts(
  userId,
  targetDate,
  year,
  month,
  workloadLimits
);
```

**Validasi yang Dilakukan:**

- ✅ Apakah user masih di bawah max 10 shifts?
- ✅ Apakah user tidak melanggar max 2 hari berturut-turut?
- ✅ Apakah ada conflict dengan jadwal existing?

### 4. **Strategi Penjadwalan Cerdas**

#### A. Skip Tanggal Existing

```bash
📅 Processing month: August 2025
⏭️  Skipping existing scheduled date: 2025-08-01
⏭️  Skipping existing scheduled date: 2025-08-02
...
⏭️  Skipping existing scheduled date: 2025-08-14
📅 Processing new date: 2025-08-15 ✅
📅 Processing new date: 2025-08-16 ✅
```

#### B. Workload-Aware Assignment

```bash
👤 User 123: 6/10 existing shifts, 4 slots available ✅
👤 User 456: 10/10 existing shifts, 0 slots available ❌ SKIP
👤 User 789: 2/10 existing shifts, 8 slots available ✅ PRIORITIZE
```

#### C. Consecutive Days Protection

```bash
🔍 User 123 worked on 2025-08-13, 2025-08-14 (2 consecutive days)
🚫 Cannot assign 2025-08-15 (would violate max 2 consecutive days)
✅ Can assign 2025-08-16 (1 day gap)
```

### 5. **Output yang Diharapkan**

#### Success Response

```json
{
  "success": true,
  "month": 8,
  "year": 2025,
  "totalShifts": 450,
  "successfulAssignments": 380,
  "fulfillmentRate": 84.4,
  "existingShiftsDetected": 168,
  "newShiftsCreated": 380,
  "daysProcessed": 17,
  "daysSkipped": 14,
  "recommendations": [
    "Jadwal bulanan berhasil dengan 84.4% fulfillment rate",
    "14 hari dilewati karena sudah ada jadwal existing",
    "4 pegawai mencapai batas maksimum shift"
  ],
  "workloadSummary": {
    "usersAtLimit": 4,
    "usersNearLimit": 8,
    "averageShiftsPerUser": 7.2
  }
}
```

#### Partial Success Response

```json
{
  "success": true,
  "month": 8,
  "year": 2025,
  "fulfillmentRate": 65.2,
  "warning": "Batasan workload yang ketat menyebabkan fulfillment rate rendah",
  "recommendations": [
    "Pertimbangkan menaikkan max shift per orang dari 10 ke 12",
    "Atau kurangi kebutuhan staff per shift",
    "Atau tambah pegawai baru"
  ]
}
```

## Implementasi yang Sudah Ditambahkan ✅

### 1. **Enhanced Monthly Scheduling**

- ✅ Deteksi jadwal existing dengan `getExistingShiftsInMonth()`
- ✅ Skip tanggal yang sudah ada jadwal
- ✅ Initialize user workload dari jadwal existing

### 2. **Advanced Workload Validation**

- ✅ `validateWorkloadWithExistingShifts()` - validasi komprehensif
- ✅ `calculateConsecutiveDaysWithExisting()` - hitung hari berturut-turut
- ✅ Real-time workload tracking during assignment

### 3. **Intelligent Assignment Algorithm**

- ✅ Filter eligible users berdasarkan workload existing
- ✅ Enhanced conflict detection
- ✅ Smart recommendations

## Testing Scenario

### Setup:

1. Buat jadwal mingguan untuk minggu 1-2 Agustus 2025
2. Set batasan: max 10 shifts/person, max 2 consecutive days
3. Buat jadwal bulanan untuk Agustus 2025

### Expected Behavior:

```bash
🔍 Checking for existing shifts in the month...
📊 Found 168 existing shifts in 8/2025
📅 Existing dates to skip: ['2025-08-01', '2025-08-02', ..., '2025-08-14']
👥 Initialized user shift counts from existing shifts:
   - User 1: 6 shifts
   - User 2: 8 shifts
   - User 3: 10 shifts (AT LIMIT)

⏭️  Skipping existing scheduled date: 2025-08-01
⏭️  Skipping existing scheduled date: 2025-08-02
...
⏭️  Skipping existing scheduled date: 2025-08-14
📅 Processing new date: 2025-08-15

🚫 User 3 rejected: already has 10/10 shifts this month
✅ User 1 accepted: 6/10 shifts, can take 4 more
🚫 User 2 rejected: would violate consecutive days limit

📊 Monthly Schedule Summary:
   - Required shifts: 450
   - Successful assignments: 380
   - Fulfillment rate: 84.4%
   - Real conflicts: 0
   - Existing shifts respected: ✅
   - Workload limits respected: ✅
```

## Benefit dari Implementasi Ini

1. **Konsistensi Data**: Tidak ada duplicate atau conflict dengan jadwal existing
2. **Workload Balance**: Respek batasan yang ditetapkan user
3. **Flexibilitas**: Bisa kombinasi jadwal mingguan + bulanan
4. **Transparansi**: Clear reporting tentang apa yang terjadi
5. **Praktis**: Sesuai dengan workflow rumah sakit yang sesungguhnya

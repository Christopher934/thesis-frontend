# 🔒 SISTEM RESTRIKSI PENJADWALAN OTOMATIS

# Dokumentasi Komprehensif - Rumah Sakit Anugerah

## 📋 OVERVIEW

Sistem Restriksi Penjadwalan Otomatis adalah implementasi lengkap dari 10 kategori restriksi yang telah didefinisikan untuk mengoptimalkan penjadwalan shift di rumah sakit. Sistem ini memastikan bahwa setiap assignment shift mematuhi semua kebijakan dan regulasi rumah sakit.

## 🎯 FITUR UTAMA

### ✅ Validasi Real-time

- Validasi instant sebelum shift di-assign
- Score 0-100 untuk setiap assignment
- Pelaporan pelanggaran dan peringatan detail

### 🎯 Optimasi Otomatis

- AI-powered user recommendation
- Analisis alternatif user terbaik
- Scoring system untuk prioritas assignment

### 📊 Compliance Monitoring

- Laporan kepatuhan berkala
- Identifikasi pattern pelanggaran
- Rekomendasi perbaikan sistem

### 🔧 Bulk Operations

- Validasi multiple shifts sekaligus
- Performance monitoring
- Batch processing untuk scheduling besar

## 🔒 10 KATEGORI RESTRIKSI

### 1️⃣ RESTRIKSI BEBAN KERJA

**Tujuan**: Mencegah overwork dan burnout pegawai

**Implementasi**:

```typescript
WORKLOAD: {
  MAX_HOURS_PER_WEEK: 40,
  MAX_HOURS_PER_MONTH: 160,
  MAX_SHIFTS_PER_MONTH: {
    'DOKTER': 18,
    'PERAWAT': 20,
    'STAF': 22,
    'SUPERVISOR': 16,
    'ADMIN': 14
  }
}
```

**Validasi**:

- ❌ Blokir jika user sudah mencapai batas bulanan
- ⚠️ Warning jika mendekati batas (>80%)
- 📊 Tracking jam kerja real-time

### 2️⃣ RESTRIKSI KETERSEDIAAN

**Tujuan**: Respect user preferences dan cuti yang sudah approved

**Implementasi**:

- Check tabel `leaves` untuk cuti/izin approved
- Check `user_preferences` untuk preferensi hari libur
- Validasi availability schedule

**Contoh**:

```sql
SELECT * FROM leaves
WHERE userId = ? AND startDate <= ? AND endDate >= ?
AND status = 'APPROVED'
```

### 3️⃣ RESTRIKSI ROLE & JABATAN

**Tujuan**: Ensure skill matching dengan kebutuhan shift

**Role Mapping**:

```typescript
ROLE_MAPPING: {
  'DOKTER': ['DOKTER', 'DOKTER_UMUM', 'DOKTER_SPESIALIS'],
  'PERAWAT': ['PERAWAT', 'PERAWAT_SENIOR', 'KEPALA_PERAWAT'],
  'STAF': ['STAF_MEDIS', 'STAF_NON_MEDIS'],
  'SUPERVISOR': ['SUPERVISOR', 'KEPALA_UNIT'],
  'ADMIN': ['ADMIN', 'STAF_ADMINISTRASI']
}
```

### 4️⃣ RESTRIKSI AKSES LOKASI

**Tujuan**: Setiap role hanya bisa bekerja di lokasi yang sesuai

**Location Access Control**:

```typescript
LOCATION_ACCESS: {
  'DOKTER': ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'KAMAR_OPERASI'],
  'PERAWAT': ['ICU', 'NICU', 'GAWAT_DARURAT', 'RAWAT_INAP', 'RAWAT_JALAN', 'RECOVERY_ROOM'],
  'STAF': ['LABORATORIUM', 'FARMASI', 'RADIOLOGI', 'FISIOTERAPI', 'GIZI'],
  'SUPERVISOR': ['ALL_LOCATIONS'],
  'ADMIN': ['FARMASI', 'LABORATORIUM', 'RADIOLOGI']
}
```

### 5️⃣ RESTRIKSI DUPLIKASI & KONFLIK WAKTU

**Tujuan**: Prevent double-booking dan ensure adequate rest

**Time Conflict Validation**:

- ❌ No overlap dengan shift existing
- ⏰ Minimum 8 jam rest antar shift
- 🔄 Handle overnight shifts dengan benar

**Algorithm**:

```typescript
hasTimeOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

calculateRestHours(lastShiftEnd, nextShiftStart) {
  return (nextShiftStart - lastShiftEnd) / (1000 * 60 * 60);
}
```

### 6️⃣ RESTRIKSI SHIFT BERUNTUN

**Tujuan**: Prevent fatigue dari continuous work

**Consecutive Limits**:

- 📅 Max 3 hari berturut-turut
- 🌙 Max 2 shift malam per minggu
- 🔄 Automatic consecutive day counting

### 7️⃣ RESTRIKSI PEMERATAAN JADWAL

**Tujuan**: Fair distribution workload antar team members

**Fairness Algorithm**:

- 📊 Calculate team average shifts
- ⚖️ Warn jika user >120% dari rata-rata
- 🎯 Prioritize under-assigned users

### 8️⃣ RESTRIKSI PREFERENSI PEGAWAI

**Tujuan**: Respect individual preferences when possible

**Preference Types**:

```typescript
enum PreferenceType {
  PREFERRED_SHIFT_TYPE,
  DAY_OFF,
  LOCATION_PREFERENCE,
  TIME_PREFERENCE,
  WORKLOAD_LIMIT,
  NOTIFICATION_SETTING,
}
```

### 9️⃣ RESTRIKSI KAPASITAS SHIFT

**Tujuan**: Ensure adequate staffing per shift/location

**Shift Requirements**:

```typescript
SHIFT_REQUIREMENTS: {
  'ICU': {
    'PAGI': { DOKTER: 1, PERAWAT: 3 },
    'SIANG': { DOKTER: 1, PERAWAT: 2 },
    'MALAM': { PERAWAT: 2 }
  },
  'GAWAT_DARURAT': {
    'PAGI': { DOKTER: 2, PERAWAT: 4 },
    'SIANG': { DOKTER: 2, PERAWAT: 3 },
    'MALAM': { DOKTER: 1, PERAWAT: 2 }
  }
}
```

### 🔟 RESTRIKSI KEBIJAKAN RUMAH SAKIT

**Tujuan**: Comply dengan regulasi internal dan eksternal

**Hospital Policies**:

- 📅 Minimum 1 hari libur dalam 7 hari
- ⏰ Maximum overtime hours per month
- 🏥 Emergency staffing requirements
- 📋 Compliance dengan labor laws

## 🚀 API ENDPOINTS

### 1. Validasi Single Shift

```http
POST /shift-restrictions/validate
Content-Type: application/json

{
  "userId": 1,
  "date": "2024-07-31",
  "startTime": "2024-07-31T07:00:00",
  "endTime": "2024-07-31T15:00:00",
  "location": "ICU",
  "shiftType": "PAGI",
  "requiredRole": "DOKTER"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "score": 85,
    "violations": [],
    "warnings": ["⚠️ User mendekati batas maksimal shift bulanan"],
    "recommendation": "🟡 Baik - Ada beberapa peringatan minor"
  },
  "message": "✅ Shift dapat diassign"
}
```

### 2. Validasi Bulk Shifts

```http
POST /shift-restrictions/validate-bulk
Content-Type: application/json

{
  "shifts": [
    {
      "userId": 1,
      "date": "2024-07-31",
      "startTime": "2024-07-31T07:00:00",
      "endTime": "2024-07-31T15:00:00",
      "location": "ICU",
      "shiftType": "PAGI"
    }
  ]
}
```

### 3. Optimasi Assignment

```http
POST /shift-restrictions/optimize
Content-Type: application/json

{
  "date": "2024-08-01",
  "location": "ICU",
  "shiftType": "PAGI",
  "requiredRole": "DOKTER"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "recommendedUser": {
      "userId": 3,
      "name": "Dr. Ahmad Rahman",
      "role": "DOKTER",
      "email": "ahmad@hospital.com",
      "score": 95
    },
    "alternatives": [
      {
        "userId": 5,
        "name": "Dr. Siti Nurhaliza",
        "role": "DOKTER",
        "score": 88,
        "issues": ["⚠️ Sudah 2 shift minggu ini"]
      }
    ]
  }
}
```

### 4. Compliance Report

```http
GET /shift-restrictions/compliance-report?startDate=2024-07-01&endDate=2024-07-31
```

### 5. Get Restriction Rules

```http
GET /shift-restrictions/rules
```

## 📊 SCORING SYSTEM

Setiap validasi menghasilkan score 0-100:

- **90-100**: 🟢 Sangat baik - Tidak ada masalah
- **70-89**: 🟡 Baik - Ada peringatan minor
- **50-69**: 🟠 Cukup - Perhatikan peringatan
- **0-49**: 🔴 Tidak dapat diassign

**Penalty Points**:

- Critical violation (duplikasi, role mismatch): -50 points
- Time constraint violation: -40 points
- Workload violation: -30 points
- Location access violation: -25 points
- Consecutive days violation: -20 points
- Fairness issue: -10 points
- Preference mismatch: -5 points

## 🔧 KONFIGURASI & SETUP

### 1. Database Schema

```sql
-- User Preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  preferenceType VARCHAR(50),
  value TEXT,
  priority INTEGER DEFAULT 1,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Leave Management
CREATE TABLE leaves (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  startDate DATE,
  endDate DATE,
  leaveType VARCHAR(50),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  requestedAt TIMESTAMP DEFAULT NOW(),
  approvedAt TIMESTAMP,
  approvedBy INTEGER,
  notes TEXT
);
```

### 2. Environment Variables

```bash
# Restriction Configuration
MAX_HOURS_PER_WEEK=40
MAX_HOURS_PER_MONTH=160
MIN_REST_HOURS_BETWEEN_SHIFTS=8
MAX_CONSECUTIVE_DAYS=3
MAX_NIGHT_SHIFTS_PER_WEEK=2
```

### 3. Module Registration

```typescript
// shift.module.ts
import { ShiftSchedulingRestrictionsService } from '../services/shift-scheduling-restrictions.service';
import { ShiftRestrictionsController } from './shift-restrictions.controller';

@Module({
  providers: [ShiftSchedulingRestrictionsService],
  controllers: [ShiftRestrictionsController],
  exports: [ShiftSchedulingRestrictionsService]
})
```

## 🧪 TESTING

### Unit Tests

```bash
npm run test -- --testPathPattern=shift-restrictions
```

### Integration Tests

```bash
node test-shift-restrictions.js
```

### Performance Tests

- Bulk validation: 50 shifts dalam <1000ms
- Single validation: <50ms average
- Optimization: <200ms untuk finding best user

## 📈 MONITORING & ANALYTICS

### Key Metrics

- **Compliance Rate**: % shifts yang memenuhi semua restriksi
- **Violation Types**: Breakdown pelanggaran per kategori
- **User Workload Distribution**: Pemerataan beban kerja
- **Optimization Success Rate**: % successful auto-assignments

### Alerts

- 🚨 Compliance rate drop dibawah 90%
- ⚠️ User approaching workload limits
- 📊 Significant workload imbalance detected
- 🔄 High rejection rate in optimization

## 🎯 BEST PRACTICES

### 1. Validation Sequence

1. Quick checks first (time conflicts, basic constraints)
2. Database queries later (workload, preferences)
3. Complex calculations last (fairness, optimization)

### 2. Performance Optimization

- Cache user workload data
- Batch database queries
- Use indexes on date/userId columns
- Lazy load non-critical validations

### 3. Error Handling

```typescript
try {
  const validation = await validateShiftAssignment(request);
  return validation;
} catch (error) {
  logger.error("Validation failed", { request, error });
  return { isValid: false, violations: ["System error"], score: 0 };
}
```

### 4. Extensibility

- Add new restriction types via enum
- Customize penalties per hospital
- Configurable thresholds
- Plugin architecture for custom rules

## 🚀 FUTURE ENHANCEMENTS

### Phase 2 Features

- 🤖 Machine Learning untuk predictive scheduling
- 📱 Mobile app untuk user preferences
- 🔄 Real-time constraint updates
- 📊 Advanced analytics dashboard

### Integration Opportunities

- 📅 Calendar systems (Outlook, Google)
- 💬 Slack/Teams notifications
- 📊 BI tools (PowerBI, Tableau)
- 🏥 Hospital management systems

## 📞 SUPPORT

Untuk support teknis atau enhancement requests:

- 📧 Email: admin@hospital.com
- 📱 WhatsApp: +62-XXX-XXXX-XXXX
- 🎫 Ticket System: helpdesk.hospital.com

---

**🎉 Sistem Restriksi Penjadwalan Otomatis siap digunakan untuk optimasi scheduling rumah sakit!**

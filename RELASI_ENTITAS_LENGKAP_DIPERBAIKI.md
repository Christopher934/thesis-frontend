# Relasi Antar Entitas - RSUD Anugerah Hospital Management System (DIPERBAIKI)

## 📊 **RELASI LENGKAP & BENAR**

### 🎯 **1. ENTITAS USER (Central Entity)**

#### **User – Shift: One-to-Many** ✅
```
🔁 Seorang user memiliki satu atau lebih shift kerja.
→ MEMILIKI: User memiliki shift kerja.
```
- **Kardinalitas**: 1:N
- **Implementasi**: `User.shifts[] ↔ Shift.user`
- **Foreign Key**: `Shift.userId → User.id`
- **Business Rule**: Setiap shift harus dimiliki oleh satu user

#### **User – Token: One-to-Many** ✅
```
🔁 User membuat token akses untuk keperluan autentikasi.
→ MEMBUAT: User membuat token akses.
```
- **Kardinalitas**: 1:N
- **Implementasi**: `User.token[] ↔ Token.user`
- **Foreign Key**: `Token.userId → User.id`
- **Purpose**: JWT authentication & session management

#### **User – Absensi: One-to-Many** ✅
```
🔁 User mencatat kehadiran berdasarkan shift yang dijalani.
→ MENCATAT: User mencatat kehadiran.
```
- **Kardinalitas**: 1:N
- **Implementasi**: `User.absensi[] ↔ Absensi.user`
- **Foreign Key**: `Absensi.userId → User.id`
- **Business Rule**: Setiap absensi terkait dengan user dan shift

#### **User – Notifikasi: One-to-Many** ✅
```
🔁 User menerima status atau notifikasi dari sistem.
→ MENERIMA: User menerima notifikasi.
```
- **Kardinalitas**: 1:N
- **Implementasi**: `User.notifications[] ↔ Notifikasi.user`
- **Foreign Key**: `Notifikasi.userId → User.id`
- **Jenis**: REMINDER_SHIFT, KONFIRMASI_TUKAR_SHIFT, SISTEM_INFO, dll.

#### **User – LoginLog: One-to-Many** ✅
```
🔁 User memiliki log aktivitas login untuk audit dan keamanan.
→ TEREKAM: User activity terekam dalam log.
```
- **Kardinalitas**: 1:N
- **Implementasi**: `User.loginLogs[] ↔ LoginLog.user`
- **Foreign Key**: `LoginLog.userId → User.id`
- **Purpose**: Security audit & session tracking

#### **User – ShiftSwap: Complex Multiple Relations** ✅
```
🔁 User dapat mengajukan, menerima, dan menyetujui permintaan tukar shift.
→ MENUKAR: User terlibat dalam proses tukar shift dengan berbagai peran.
```
- **Multiple Relations**:
  - **Pengaju**: `User.swapFrom[] ↔ ShiftSwap.fromUser`
  - **Target**: `User.swapTo[] ↔ ShiftSwap.toUser`
  - **Supervisor Approver**: `User.supervisorApprovals[]`
  - **Target Approver**: `User.targetApprovals[]`
  - **Unit Head Approver**: `User.unitHeadApprovals[]`

### 🎯 **2. ENTITAS SHIFT**

#### **Shift – User: Many-to-One** ✅
```
🔁 Setiap shift dimiliki oleh satu user.
→ DIMILIKI: Shift dimiliki oleh user.
```
- **Kardinalitas**: N:1
- **Implementasi**: `Shift.user ↔ User.shifts[]`
- **Foreign Key**: `Shift.userId → User.id`

#### **Shift – Absensi: One-to-One** ✅
```
🔁 Setiap shift memiliki satu record absensi yang wajib.
→ DICATAT: Shift dicatat kehadirannya dalam absensi.
```
- **Kardinalitas**: 1:1 (Mandatory)
- **Implementasi**: `Shift.absensi ↔ Absensi.shift`
- **Foreign Key**: `Absensi.shiftId → Shift.id` (UNIQUE)
- **Business Rule**: Setiap shift HARUS memiliki record absensi

#### **Shift – ShiftSwap: One-to-One Optional** ✅
```
🔁 Shift dapat dipertukarkan melalui sistem swap (opsional).
→ DIPERTUKARKAN: Shift dapat diswap dengan shift lain.
```
- **Kardinalitas**: 1:1 (Optional)
- **Implementasi**: `Shift.swap ↔ ShiftSwap.shift`
- **Foreign Key**: `ShiftSwap.shiftId → Shift.id` (UNIQUE)
- **Business Rule**: Tidak semua shift perlu di-swap

### 🎯 **3. ENTITAS KEGIATAN (Independent)** ⚠️
```
🔁 Kegiatan menargetkan user berdasarkan kriteria tertentu (tidak ada relasi langsung).
→ MENARGETKAN: Kegiatan menargetkan user melalui field targetPeserta.
```
- **Kardinalitas**: Independent (No direct FK)
- **Implementasi**: `Kegiatan.targetPeserta: String[]`
- **Business Rule**: Partisipasi dikelola melalui array string, bukan foreign key

### 🎯 **4. ENTITAS ABSENSI (Bridge Entity)**

#### **Absensi – User: Many-to-One** ✅
```
🔁 Setiap absensi dimiliki oleh satu user.
→ DIMILIKI: Absensi dimiliki oleh user.
```

#### **Absensi – Shift: One-to-One** ✅
```
🔁 Setiap absensi terkait dengan satu shift.
→ TERKAIT: Absensi terkait dengan shift.
```

---

## 📋 **DIAGRAM RELASI LENGKAP**

```
User (Central Entity)
├── Shift (1:N) ────┐
├── Token (1:N)     │
├── Absensi (1:N) ──┼─── Shift ──── Absensi (1:1)
├── Notifikasi (1:N)│                   │
├── LoginLog (1:N)  │                   │
└── ShiftSwap (M:N) ┴─── Shift ──── ShiftSwap (1:1 optional)
    ├── fromUser
    ├── toUser
    ├── supervisorApprover
    ├── targetApprover
    └── unitHeadApprover

Kegiatan (Independent)
└── targetPeserta: String[] (No FK relation)
```

---

## 🔧 **BUSINESS RULES & CONSTRAINTS**

### **Primary Rules:**
1. **User**: Central entity dengan banyak relasi
2. **Shift**: Harus dimiliki user, harus memiliki absensi
3. **Absensi**: Bridge antara User dan Shift (mandatory)
4. **ShiftSwap**: Complex approval workflow dengan multiple user roles
5. **Kegiatan**: Independent, menggunakan targeting system

### **Data Integrity:**
- **Cascade Delete**: User → Shift → Absensi
- **Unique Constraints**: Absensi.shiftId, ShiftSwap.shiftId
- **Referential Integrity**: Semua FK must exist
- **Business Logic**: Approval workflow untuk ShiftSwap

---

## 📊 **SUMMARY RELASI YANG BENAR**

### **✅ TOTAL RELASI: 9 Relasi Utama**

1. **User → Shift** (1:N)
2. **User → Token** (1:N)
3. **User → Absensi** (1:N)
4. **User → Notifikasi** (1:N)
5. **User → LoginLog** (1:N)
6. **User → ShiftSwap** (M:N Complex)
7. **Shift → Absensi** (1:1)
8. **Shift → ShiftSwap** (1:1 Optional)
9. **Kegiatan** (Independent Entity)

### **🎯 PERBAIKAN DARI VERSI SEBELUMNYA:**

- ✅ **Fixed**: User-Kegiatan relation (sekarang dijelaskan sebagai independent)
- ✅ **Added**: User-LoginLog relation
- ✅ **Added**: User-ShiftSwap complex relations
- ✅ **Added**: Shift-Absensi mandatory relation
- ✅ **Added**: Shift-ShiftSwap optional relation
- ✅ **Enhanced**: Business rules dan constraints
- ✅ **Completed**: Diagram relasi visual

**Tingkat Kelengkapan**: **100% LENGKAP** 🎯

---

*Dokumen ini memberikan gambaran lengkap dan benar tentang relasi antar entitas dalam RSUD Anugerah Hospital Management System berdasarkan implementasi database aktual.*

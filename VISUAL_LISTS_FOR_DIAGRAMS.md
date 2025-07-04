# 📊 VISUAL LISTS FOR RSUD ANUGERAH DIAGRAMS

**Easy Copy Format for Visual Diagram Creation**

---

## 🎯 **USE CASE DIAGRAM - VISUAL LIST**

### **ACTORS:**

```
1. Admin
2. Supervisor
3. Dokter
4. Perawat
5. Staf
6. Telegram Bot (External)
7. Database System (External)
```

### **USE CASES BY ACTOR:**

#### **ADMIN USE CASES:**

```
• Manage Users
• Create Employee Account
• Update Employee Information
• Deactivate Employee Account
• View All Employees
• Generate Employee ID
• Manage Shifts
• Create Shift Schedule
• Assign Shift to Employee
• Modify Shift Details
• Delete Shift
• View All Shifts
• Manage Attendance
• View All Attendance Records
• Generate Attendance Reports
• Override Attendance Status
• Export Attendance Data
• Manage Activities
• Create Hospital Activity
• Schedule Events
• Assign Participants
• Monitor Activity Progress
• System Administration
• Configure System Settings
• Monitor System Logs
• Manage Notifications
• Generate Reports
```

#### **SUPERVISOR USE CASES:**

```
• Team Management
• View Team Members
• Assign Shifts to Team
• Approve Shift Swaps
• Monitor Team Attendance
• Approval Workflows
• Approve/Reject Shift Swap Requests
• Review Leave Requests
• Validate Attendance Records
• Reporting
• Generate Team Reports
• Monitor Team Performance
• View Department Statistics
```

#### **EMPLOYEE USE CASES (Dokter, Perawat, Staf):**

```
• Personal Management
• View Personal Profile
• Update Contact Information
• Change Password
• Shift Management
• View My Shifts
• Request Shift Swap
• View Shift Calendar
• Attendance
• Clock In/Out
• View My Attendance History
• Submit Attendance Photo
• Notifications
• View Notifications
• Mark Notifications as Read
• Respond to Interactive Notifications
• Activities
• View Assigned Activities
• Register for Events
• View Activity Details
```

### **RELATIONSHIPS:**

```
INHERITANCE:
• Employee → Dokter
• Employee → Perawat
• Employee → Staf

INCLUDE:
• Request Shift Swap → Validate Employee ID
• Clock In/Out → Verify Shift Assignment
• Generate Reports → Retrieve Data

EXTEND:
• Clock In/Out ← Submit Attendance Photo
• View Notifications ← Send Telegram Notification
• Approve Shift Swap ← Notify All Parties
```

---

## 🔄 **ACTIVITY DIAGRAM - VISUAL LISTS**

### **1. EMPLOYEE LOGIN PROCESS:**

```
START
↓
Enter Username/Password
↓
[Valid Credentials?]
├── YES → Login Success
│   ↓
│   Create Login Log Entry
│   ↓
│   Generate Session Token
│   ↓
│   Load User Dashboard
│   ↓
│   END (Dashboard)
└── NO → Login Failed
    ↓
    Show Error Message
    ↓
    [Retry?]
    ├── YES → Back to Enter Credentials
    └── NO → END (Failed)
```

### **2. SHIFT ASSIGNMENT PROCESS:**

```
START (Admin creates shift)
↓
Select Employee by Employee ID
↓
Choose Shift Date & Time
↓
Select Location (RSUD Departments)
↓
[Validate Shift Conflict?]
├── NO CONFLICT → Create Shift Record
│   ↓
│   Save to Database
│   ↓
│   Send Notification to Employee
│   ↓
│   [Telegram Enabled?]
│   ├── YES → Send Telegram Notification
│   └── NO → Skip Telegram
│   ↓
│   END (Success)
└── CONFLICT EXISTS → Show Error
    ↓
    Suggest Alternative Times
    ↓
    Back to Choose Date & Time
```

### **3. SHIFT SWAP REQUEST PROCESS:**

```
START (Employee requests swap)
↓
Select Shift to Swap
↓
Choose Target Employee
↓
Enter Swap Reason
↓
Submit Request (Status: PENDING)
↓
Notify Target Employee
↓
[Target Response?]
├── APPROVED → Status: APPROVED_BY_TARGET
│   ↓
│   [Requires Unit Head?]
│   ├── YES → Notify Unit Head
│   │   ↓
│   │   [Unit Head Response?]
│   │   ├── APPROVED → Status: WAITING_SUPERVISOR
│   │   │   ↓
│   │   │   Notify Supervisor
│   │   │   ↓
│   │   │   [Supervisor Response?]
│   │   │   ├── APPROVED → Status: APPROVED
│   │   │   │   ↓
│   │   │   │   Execute Shift Swap
│   │   │   │   ↓
│   │   │   │   Update Shift Records
│   │   │   │   ↓
│   │   │   │   Notify All Parties
│   │   │   │   ↓
│   │   │   │   END (Success)
│   │   │   └── REJECTED → Status: REJECTED_BY_SUPERVISOR
│   │   │       ↓
│   │   │       Notify Requester
│   │   │       ↓
│   │   │       END (Rejected)
│   │   └── REJECTED → Status: REJECTED_BY_UNIT_HEAD
│   │       ↓
│   │       Notify Requester
│   │       ↓
│   │       END (Rejected)
│   └── NO → Direct to Supervisor (WAITING_SUPERVISOR)
└── REJECTED → Status: REJECTED_BY_TARGET
    ↓
    Notify Requester
    ↓
    END (Rejected)
```

### **4. ATTENDANCE CLOCK IN/OUT PROCESS:**

```
CLOCK IN:
START (Employee clocks in)
↓
Verify Employee Identity
↓
Check Current Shift Assignment
↓
[Has Active Shift?]
├── YES → Record Clock In Time
│   ↓
│   [On Time?]
│   ├── ON TIME → Status: HADIR
│   └── LATE → Status: TERLAMBAT
│   ↓
│   Capture Location (Optional)
│   ↓
│   Take Photo (Optional)
│   ↓
│   Save Attendance Record
│   ↓
│   Send Confirmation Notification
│   ↓
│   END (Clocked In)
└── NO → Show Error "No Active Shift"
    ↓
    END (Error)

CLOCK OUT:
START (Employee clocks out)
↓
Find Active Attendance Record
↓
Record Clock Out Time
↓
Calculate Total Work Hours
↓
Update Attendance Status if needed
↓
Save Changes
↓
Send Completion Notification
↓
END (Clocked Out)
```

### **5. NOTIFICATION SYSTEM PROCESS:**

```
START (System generates notification)
↓
Determine Notification Type
↓
Identify Target User(s)
↓
Create Notification Record
↓
[Notification Channel?]
├── WEB → Store in Database
│   ↓
│   Set sentVia: "WEB"
│   ↓
│   Update User Interface
│   ↓
│   Mark as Delivered
├── TELEGRAM → Check Telegram Setup
│   ↓
│   [Has Telegram Chat ID?]
│   ├── YES → Send via Telegram Bot
│   │   ↓
│   │   [Success?]
│   │   ├── YES → Set telegramSent: true
│   │   └── NO → Set telegramSent: false
│   └── NO → Skip Telegram
│   ↓
│   Update Notification Record
└── BOTH → Execute WEB and TELEGRAM
↓
[Interactive Notification?]
├── YES → Add Response Handling
│   ↓
│   Store JSON Data
│   ↓
│   Set up Response Webhook
│   ↓
│   Enable User Actions
└── NO → Standard Notification
↓
END (Notification Sent)
```

---

## 🗃️ **ERD CROW'S FOOT - VISUAL LIST**

### **ENTITIES:**

```
1. USER (Central Entity)
2. SHIFT (Core Business)
3. ABSENSI (Transaction)
4. SHIFTSWAP (Business Process)
5. NOTIFIKASI (Communication)
6. KEGIATAN (Independent)
7. TOKEN (Authentication)
8. LOGINLOG (Audit)
```

### **ENTITY ATTRIBUTES:**

#### **USER:**

```
• id (PK, INT, Auto-increment)
• employeeId (UNIQUE, VARCHAR) - Format: XXX001
• username (UNIQUE, VARCHAR)
• email (UNIQUE, VARCHAR)
• password (VARCHAR)
• namaDepan (VARCHAR)
• namaBelakang (VARCHAR)
• alamat (VARCHAR, NULLABLE)
• noHp (VARCHAR)
• jenisKelamin (VARCHAR) - L/P
• tanggalLahir (DATE)
• role (ENUM) - ADMIN, DOKTER, PERAWAT, STAF, SUPERVISOR
• status (VARCHAR) - ACTIVE/INACTIVE
• telegramChatId (VARCHAR, NULLABLE)
• createdAt (TIMESTAMP)
• updatedAt (TIMESTAMP)
```

#### **SHIFT:**

```
• id (PK, INT, Auto-increment)
• userId (FK → USER.id)
• tanggal (DATE)
• jammulai (VARCHAR)
• jamselesai (VARCHAR)
• lokasishift (VARCHAR)
• lokasiEnum (ENUM)
• tipeEnum (ENUM)
• tipeshift (VARCHAR, NULLABLE)
• shiftNumber (INT, NULLABLE)
• shiftType (ENUM, NULLABLE)
• createdAt (TIMESTAMP)
• updatedAt (TIMESTAMP)
```

#### **ABSENSI:**

```
• id (PK, INT, Auto-increment)
• userId (FK → USER.id)
• shiftId (FK → SHIFT.id, UNIQUE)
• jamMasuk (TIMESTAMP, NULLABLE)
• jamKeluar (TIMESTAMP, NULLABLE)
• status (ENUM) - HADIR, TERLAMBAT, IZIN, ALFA
• catatan (TEXT, NULLABLE)
• foto (VARCHAR, NULLABLE)
• lokasi (VARCHAR, NULLABLE)
• createdAt (TIMESTAMP)
• updatedAt (TIMESTAMP)
```

#### **SHIFTSWAP:**

```
• id (PK, INT, Auto-increment)
• fromUserId (FK → USER.id)
• toUserId (FK → USER.id)
• shiftId (FK → SHIFT.id, UNIQUE)
• status (ENUM) - Multi-level approval status
• alasan (TEXT, NULLABLE)
• tanggalSwap (DATE)
• rejectionReason (TEXT, NULLABLE)
• requiresUnitHead (BOOLEAN)
• supervisorApprovedAt (TIMESTAMP, NULLABLE)
• supervisorApprovedBy (INT, NULLABLE)
• targetApprovedAt (TIMESTAMP, NULLABLE)
• targetApprovedBy (INT, NULLABLE)
• unitHeadApprovedAt (TIMESTAMP, NULLABLE)
• unitHeadApprovedBy (INT, NULLABLE)
• createdAt (TIMESTAMP)
• updatedAt (TIMESTAMP)
```

#### **NOTIFIKASI:**

```
• id (PK, INT, Auto-increment)
• userId (FK → USER.id)
• judul (VARCHAR)
• pesan (TEXT)
• jenis (ENUM) - 16 notification types
• status (ENUM) - UNREAD, READ, ARCHIVED
• data (JSON, NULLABLE)
• sentVia (VARCHAR) - WEB/TELEGRAM/BOTH
• telegramSent (BOOLEAN)
• createdAt (TIMESTAMP)
• updatedAt (TIMESTAMP)
```

#### **KEGIATAN:**

```
• id (PK, INT, Auto-increment)
• nama (VARCHAR)
• deskripsi (TEXT)
• anggaran (INT, NULLABLE)
• catatan (TEXT, NULLABLE)
• departemen (VARCHAR, NULLABLE)
• jenisKegiatan (VARCHAR)
• kapasitas (INT, NULLABLE)
• kontak (VARCHAR, NULLABLE)
• lokasi (VARCHAR)
• lokasiDetail (VARCHAR, NULLABLE)
• penanggungJawab (VARCHAR)
• prioritas (VARCHAR)
• status (VARCHAR)
• tanggalMulai (DATE)
• tanggalSelesai (DATE, NULLABLE)
• targetPeserta (TEXT[])
• waktuMulai (VARCHAR)
• waktuSelesai (VARCHAR, NULLABLE)
• createdAt (TIMESTAMP)
• updatedAt (TIMESTAMP)
```

#### **TOKEN:**

```
• id (PK, INT, Auto-increment)
• userId (FK → USER.id)
• token (VARCHAR, UNIQUE)
• expiredAt (TIMESTAMP)
• createdAt (TIMESTAMP)
```

#### **LOGINLOG:**

```
• id (PK, INT, Auto-increment)
• userId (FK → USER.id)
• ipAddress (VARCHAR, NULLABLE)
• userAgent (TEXT, NULLABLE)
• loginAt (TIMESTAMP)
```

### **RELATIONSHIPS (CROW'S FOOT):**

```
ONE-TO-MANY:
• USER ||--o{ SHIFT (1:N)
• USER ||--o{ ABSENSI (1:N)
• USER ||--o{ NOTIFIKASI (1:N)
• USER ||--o{ TOKEN (1:N)
• USER ||--o{ LOGINLOG (1:N)

ONE-TO-ONE:
• SHIFT ||--|| ABSENSI (1:1)
• SHIFT ||--o| SHIFTSWAP (1:0..1)

MANY-TO-MANY:
• USER }--{ USER (via SHIFTSWAP) (M:N)
```

### **VISUAL LAYOUT:**

```
         ┌─────────────┐
         │    USER     │ (Central)
         │ (Blue)      │
         └──────┬──────┘
                │
    ┌───────────┼───────────┬─────────┬───────────┐
    │           │           │         │           │
┌───▼───┐   ┌───▼───┐   ┌───▼────┐ ┌─▼─────┐ ┌───▼────┐
│ SHIFT │   │ TOKEN │   │LOGINLOG│ │NOTIFI- │ │ABSENSI │
│(Blue) │   │(Gray) │   │ (Gray) │ │KASI    │ │ (Blue) │
└───┬───┘   └───────┘   └────────┘ │(Green) │ └───▲────┘
    │                              └────────┘     │
┌───▼─────┐                                       │
│SHIFTSWAP│                                       │
│ (Green) │───────────────────────────────────────┘
└─────────┘

┌─────────────┐
│  KEGIATAN   │ (Independent)
│  (Orange)   │
└─────────────┘
```

---

## 🏗️ **PDM (PHYSICAL DATA MODEL) - VISUAL LIST**

### **DATABASE CONFIG:**

```
• Database: PostgreSQL 14+
• Character Set: UTF-8
• Collation: en_US.UTF-8
• Schema: public
• Total Tables: 8
• Total Enums: 8
```

### **ENUMERATIONS:**

```
1. Role: ADMIN, DOKTER, PERAWAT, STAF, SUPERVISOR
2. AbsensiStatus: HADIR, TERLAMBAT, IZIN, ALFA
3. SwapStatus: PENDING, APPROVED_BY_TARGET, REJECTED_BY_TARGET, WAITING_UNIT_HEAD, REJECTED_BY_UNIT_HEAD, WAITING_SUPERVISOR, REJECTED_BY_SUPERVISOR, APPROVED
4. LokasiShift: GEDUNG_ADMINISTRASI, RAWAT_JALAN, RAWAT_INAP, GAWAT_DARURAT, LABORATORIUM, FARMASI, RADIOLOGI, GIZI, KEAMANAN, LAUNDRY, CLEANING_SERVICE, SUPIR, ICU, NICU
5. TipeShift: PAGI, SIANG, MALAM, ON_CALL, JAGA
6. ShiftType: GEDUNG_ADMINISTRASI, RAWAT_JALAN, RAWAT_INAP_3_SHIFT, GAWAT_DARURAT_3_SHIFT, LABORATORIUM_2_SHIFT, FARMASI_2_SHIFT, RADIOLOGI_2_SHIFT, GIZI_2_SHIFT, KEAMANAN_2_SHIFT, LAUNDRY_REGULER, CLEANING_SERVICE, SUPIR_2_SHIFT
7. JenisNotifikasi: REMINDER_SHIFT, KONFIRMASI_TUKAR_SHIFT, PERSETUJUAN_CUTI, KEGIATAN_HARIAN, ABSENSI_TERLAMBAT, SHIFT_BARU_DITAMBAHKAN, SISTEM_INFO, PENGUMUMAN, PERSONAL_REMINDER_ABSENSI, TUGAS_PERSONAL, HASIL_EVALUASI_PERSONAL, KONFIRMASI_SHIFT_SWAP_PERSONAL, PENGUMUMAN_INTERAKTIF, NOTIFIKASI_DIREKTUR, REMINDER_MEETING_PERSONAL, PERINGATAN_PERSONAL
8. StatusNotifikasi: UNREAD, READ, ARCHIVED
```

### **TABLE STRUCTURES:**

#### **USERS TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
employeeId         | VARCHAR(10)            | UNIQUE NOT NULL
username           | VARCHAR(50)            | UNIQUE NOT NULL
email              | VARCHAR(100)           | UNIQUE NOT NULL
password           | VARCHAR(255)           | NOT NULL
namaDepan          | VARCHAR(50)            | NOT NULL
namaBelakang       | VARCHAR(50)            | NOT NULL
alamat             | TEXT                   | NULL
noHp               | VARCHAR(20)            | NOT NULL
jenisKelamin       | VARCHAR(1)             | CHECK (L/P)
tanggalLahir       | DATE                   | NOT NULL
role               | Role ENUM              | NOT NULL
status             | VARCHAR(20)            | DEFAULT 'ACTIVE'
telegramChatId     | VARCHAR(50)            | NULL
createdAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
updatedAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **SHIFTS TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
userId             | INTEGER                | FK → users(id) CASCADE
tanggal            | DATE                   | NOT NULL
jammulai           | VARCHAR(5)             | NOT NULL, TIME FORMAT
jamselesai         | VARCHAR(5)             | NOT NULL, TIME FORMAT
lokasishift        | VARCHAR(100)           | NOT NULL
lokasiEnum         | LokasiShift ENUM       | NULL
tipeEnum           | TipeShift ENUM         | NULL
tipeshift          | VARCHAR(50)            | NULL
shiftNumber        | INTEGER                | NULL
shiftType          | ShiftType ENUM         | NULL
createdAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
updatedAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **ABSENSIS TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
userId             | INTEGER                | FK → users(id) CASCADE
shiftId            | INTEGER                | FK → shifts(id) CASCADE, UNIQUE
jamMasuk           | TIMESTAMP WITH TZ      | NULL
jamKeluar          | TIMESTAMP WITH TZ      | NULL
status             | AbsensiStatus ENUM     | NOT NULL
catatan            | TEXT                   | NULL
foto               | VARCHAR(255)           | NULL
lokasi             | VARCHAR(255)           | NULL
createdAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
updatedAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **SHIFTSWAPS TABLE:**

```
Column Name           | Data Type              | Constraints
----------------------|------------------------|------------------
id                    | SERIAL                 | PRIMARY KEY
fromUserId            | INTEGER                | FK → users(id) CASCADE
toUserId              | INTEGER                | FK → users(id) CASCADE
shiftId               | INTEGER                | FK → shifts(id) CASCADE, UNIQUE
status                | SwapStatus ENUM        | DEFAULT 'PENDING'
alasan                | TEXT                   | NULL
tanggalSwap           | DATE                   | NOT NULL
rejectionReason       | TEXT                   | NULL
requiresUnitHead      | BOOLEAN                | DEFAULT FALSE
supervisorApprovedAt  | TIMESTAMP WITH TZ      | NULL
supervisorApprovedBy  | INTEGER                | NULL
targetApprovedAt      | TIMESTAMP WITH TZ      | NULL
targetApprovedBy      | INTEGER                | NULL
unitHeadApprovedAt    | TIMESTAMP WITH TZ      | NULL
unitHeadApprovedBy    | INTEGER                | NULL
createdAt             | TIMESTAMP WITH TZ      | DEFAULT NOW()
updatedAt             | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **NOTIFIKASI TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
userId             | INTEGER                | FK → users(id) CASCADE
judul              | VARCHAR(200)           | NOT NULL
pesan              | TEXT                   | NOT NULL
jenis              | JenisNotifikasi ENUM   | NOT NULL
status             | StatusNotifikasi ENUM  | DEFAULT 'UNREAD'
data               | JSONB                  | NULL
sentVia            | VARCHAR(20)            | DEFAULT 'WEB'
telegramSent       | BOOLEAN                | DEFAULT FALSE
createdAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
updatedAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **KEGIATANS TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
nama               | VARCHAR(200)           | NOT NULL
deskripsi          | TEXT                   | NOT NULL
anggaran           | INTEGER                | NULL
catatan            | TEXT                   | NULL
departemen         | VARCHAR(100)           | NULL
jenisKegiatan      | VARCHAR(100)           | NOT NULL
kapasitas          | INTEGER                | NULL
kontak             | VARCHAR(100)           | NULL
lokasi             | VARCHAR(200)           | NOT NULL
lokasiDetail       | TEXT                   | NULL
penanggungJawab    | VARCHAR(100)           | NOT NULL
prioritas          | VARCHAR(20)            | CHECK (RENDAH/SEDANG/TINGGI/URGENT)
status             | VARCHAR(20)            | CHECK (DRAFT/ACTIVE/COMPLETED/CANCELLED)
tanggalMulai       | DATE                   | NOT NULL
tanggalSelesai     | DATE                   | NULL
targetPeserta      | TEXT[]                 | NULL
waktuMulai         | VARCHAR(5)             | NOT NULL
waktuSelesai       | VARCHAR(5)             | NULL
createdAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
updatedAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **TOKENS TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
userId             | INTEGER                | FK → users(id) CASCADE
token              | VARCHAR(500)           | UNIQUE NOT NULL
expiredAt          | TIMESTAMP WITH TZ      | NOT NULL
createdAt          | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

#### **LOGIN_LOGS TABLE:**

```
Column Name        | Data Type              | Constraints
-------------------|------------------------|------------------
id                 | SERIAL                 | PRIMARY KEY
userId             | INTEGER                | FK → users(id) CASCADE
ipAddress          | INET                   | NULL
userAgent          | TEXT                   | NULL
loginAt            | TIMESTAMP WITH TZ      | DEFAULT NOW()
```

### **INDEXES:**

```
PRIMARY INDEXES (Automatic):
• All id columns

PERFORMANCE INDEXES:
• idx_users_employee_id ON users(employeeId)
• idx_users_email ON users(email)
• idx_users_role ON users(role)
• idx_shifts_user_id ON shifts(userId)
• idx_shifts_tanggal ON shifts(tanggal)
• idx_shifts_user_date ON shifts(userId, tanggal)
• idx_absensis_user_id ON absensis(userId)
• idx_absensis_shift_id ON absensis(shiftId)
• idx_shiftswaps_from_user ON shiftswaps(fromUserId)
• idx_shiftswaps_to_user ON shiftswaps(toUserId)
• idx_shiftswaps_status ON shiftswaps(status)
• idx_notifikasi_user_id ON notifikasi(userId)
• idx_notifikasi_status ON notifikasi(status)
• idx_notifikasi_user_status ON notifikasi(userId, status)
• idx_tokens_user_id ON tokens(userId)
• idx_login_logs_user_id ON login_logs(userId)
```

### **KEY CONSTRAINTS:**

```
BUSINESS RULES:
• Employee ID Format: XXX001 (ADM001, DOK001, PER001, STF001, SUP001)
• Shift Time Logic: jammulai vs jamselesai validation
• Attendance Time Logic: jamKeluar > jamMasuk
• Activity Date Logic: tanggalSelesai >= tanggalMulai
• No Self Swap: fromUserId != toUserId
• One Attendance per Shift: shiftId UNIQUE in absensis
• One Swap per Shift: shiftId UNIQUE in shiftswaps

FOREIGN KEY CASCADE:
• All user references: ON DELETE CASCADE
• All shift references: ON DELETE CASCADE
```

---

## 📋 **USAGE INSTRUCTIONS**

### **For Use Case Diagram:**

```
1. Copy actors list
2. Copy use cases by actor
3. Show inheritance: Employee → (Dokter, Perawat, Staf)
4. Add include/extend relationships
5. Draw system boundary
```

### **For Activity Diagrams:**

```
1. Use 5 main processes provided
2. Show decision points with diamonds
3. Add parallel flows for notifications
4. Use swim lanes for different roles
5. Include start/end nodes
```

### **For ERD Crow's Foot:**

```
1. Place USER entity in center
2. Draw relationships with exact cardinalities
3. Use color coding: Blue (core), Green (process), Orange (events), Gray (system)
4. Show all foreign keys with crow's foot notation
5. Include relationship labels
```

### **For PDM:**

```
1. Create 8 enumerations first
2. Create tables in dependency order
3. Add all indexes for performance
4. Include business rule constraints
5. Use PostgreSQL-specific data types
```

**✅ Ready for Visual Diagram Creation!**

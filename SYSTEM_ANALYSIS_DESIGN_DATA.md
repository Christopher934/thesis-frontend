# 📊 RSUD Anugerah Hospital Management System

## Use Case Diagram, Activity Diagram, ERD Crow's Foot & PDM Data

**Generated Date**: July 4, 2025  
**System Version**: v2.0  
**Database**: PostgreSQL

---

## 🎯 **USE CASE DIAGRAM DATA**

### **Actors & Their Roles**

#### **Primary Actors:**

1. **Admin** - System administrator with full access
2. **Supervisor** - Department supervisor with management privileges
3. **Dokter** - Medical doctor with specialized access
4. **Perawat** - Nurse with patient care responsibilities
5. **Staf** - General hospital staff with basic access

#### **Secondary Actors:**

6. **Telegram Bot** - External notification system
7. **Database System** - Data persistence layer

### **Use Cases by Actor**

#### **Admin Use Cases:**

```
1. Manage Users
   - Create Employee Account
   - Update Employee Information
   - Deactivate Employee Account
   - View All Employees
   - Generate Employee ID

2. Manage Shifts
   - Create Shift Schedule
   - Assign Shift to Employee
   - Modify Shift Details
   - Delete Shift
   - View All Shifts

3. Manage Attendance
   - View All Attendance Records
   - Generate Attendance Reports
   - Override Attendance Status
   - Export Attendance Data

4. Manage Activities
   - Create Hospital Activity
   - Schedule Events
   - Assign Participants
   - Monitor Activity Progress

5. System Administration
   - Configure System Settings
   - Monitor System Logs
   - Manage Notifications
   - Generate Reports
```

#### **Supervisor Use Cases:**

```
1. Team Management
   - View Team Members
   - Assign Shifts to Team
   - Approve Shift Swaps
   - Monitor Team Attendance

2. Approval Workflows
   - Approve/Reject Shift Swap Requests
   - Review Leave Requests
   - Validate Attendance Records

3. Reporting
   - Generate Team Reports
   - Monitor Team Performance
   - View Department Statistics
```

#### **Employee Use Cases (Dokter, Perawat, Staf):**

```
1. Personal Management
   - View Personal Profile
   - Update Contact Information
   - Change Password

2. Shift Management
   - View My Shifts
   - Request Shift Swap
   - View Shift Calendar

3. Attendance
   - Clock In/Out
   - View My Attendance History
   - Submit Attendance Photo

4. Notifications
   - View Notifications
   - Mark Notifications as Read
   - Respond to Interactive Notifications

5. Activities
   - View Assigned Activities
   - Register for Events
   - View Activity Details
```

### **Use Case Relationships:**

```
Inheritance Relationships:
- Employee → (Dokter, Perawat, Staf)

Include Relationships:
- "Request Shift Swap" includes "Validate Employee ID"
- "Clock In/Out" includes "Verify Shift Assignment"
- "Generate Reports" includes "Retrieve Data"

Extend Relationships:
- "Clock In/Out" extends "Submit Attendance Photo"
- "View Notifications" extends "Send Telegram Notification"
- "Approve Shift Swap" extends "Notify All Parties"
```

---

## 🔄 **ACTIVITY DIAGRAM DATA**

### **1. Employee Login Process**

```
Start
└── Enter Username/Password
    ├── [Valid Credentials] → Login Success
    │   ├── Create Login Log Entry
    │   ├── Generate Session Token
    │   ├── Load User Dashboard
    │   └── End (Dashboard)
    └── [Invalid Credentials] → Login Failed
        ├── Show Error Message
        ├── [Retry?] → Yes: Loop back to Enter Credentials
        └── [Retry?] → No: End (Failed)
```

### **2. Shift Assignment Process**

```
Start (Admin creates shift)
├── Select Employee by Employee ID
├── Choose Shift Date & Time
├── Select Location (RSUD Departments)
├── [Validate Shift Conflict]
│   ├── [No Conflict] → Create Shift Record
│   │   ├── Save to Database
│   │   ├── Send Notification to Employee
│   │   ├── [Telegram Enabled?] → Send Telegram Notification
│   │   └── End (Success)
│   └── [Conflict Exists] → Show Error
│       ├── Suggest Alternative Times
│       └── Return to Choose Date & Time
```

### **3. Shift Swap Request Process**

```
Start (Employee requests swap)
├── Select Shift to Swap
├── Choose Target Employee
├── Enter Swap Reason
├── Submit Request
    ├── Create ShiftSwap Record (Status: PENDING)
    ├── Notify Target Employee
    ├── [Target Response]
    │   ├── [Approved by Target] → Status: APPROVED_BY_TARGET
    │   │   ├── [Requires Unit Head?] → Yes: Notify Unit Head
    │   │   │   ├── [Unit Head Response]
    │   │   │   │   ├── [Approved] → Status: WAITING_SUPERVISOR
    │   │   │   │   │   ├── Notify Supervisor
    │   │   │   │   │   ├── [Supervisor Response]
    │   │   │   │   │   │   ├── [Approved] → Status: APPROVED
    │   │   │   │   │   │   │   ├── Execute Shift Swap
    │   │   │   │   │   │   │   ├── Update Shift Records
    │   │   │   │   │   │   │   ├── Notify All Parties
    │   │   │   │   │   │   │   └── End (Success)
    │   │   │   │   │   │   └── [Rejected] → Status: REJECTED_BY_SUPERVISOR
    │   │   │   │   │   │       ├── Notify Requester
    │   │   │   │   │   │       └── End (Rejected)
    │   │   │   │   └── [Rejected] → Status: REJECTED_BY_UNIT_HEAD
    │   │   │   │       ├── Notify Requester
    │   │   │   │       └── End (Rejected)
    │   │   │   └── No: Direct to Supervisor (Status: WAITING_SUPERVISOR)
    │   │   └── [Same process as above from Supervisor]
    │   └── [Rejected by Target] → Status: REJECTED_BY_TARGET
    │       ├── Notify Requester
    │       └── End (Rejected)
```

### **4. Attendance Clock In/Out Process**

```
Start (Employee clocks in)
├── Verify Employee Identity
├── Check Current Shift Assignment
├── [Has Active Shift?]
│   ├── [Yes] → Record Clock In Time
│   │   ├── [On Time?] → Status: HADIR
│   │   ├── [Late?] → Status: TERLAMBAT
│   │   ├── Capture Location (Optional)
│   │   ├── Take Photo (Optional)
│   │   ├── Save Attendance Record
│   │   ├── Send Confirmation Notification
│   │   └── End (Clocked In)
│   └── [No] → Show Error "No Active Shift"
│       └── End (Error)

Clock Out Process:
├── Find Active Attendance Record
├── Record Clock Out Time
├── Calculate Total Work Hours
├── Update Attendance Status if needed
├── Save Changes
├── Send Completion Notification
└── End (Clocked Out)
```

### **5. Enhanced Notification System Process**

```
Start (System generates notification)
├── Determine Notification Type
├── Identify Target User(s)
├── Create Notification Record
├── [Notification Channel]
│   ├── [WEB] → Store in Database
│   │   ├── Set sentVia: "WEB"
│   │   ├── Update User Interface
│   │   └── Mark as Delivered
│   ├── [TELEGRAM] → Check Telegram Setup
│   │   ├── [Has Telegram Chat ID?]
│   │   │   ├── [Yes] → Send via Telegram Bot
│   │   │   │   ├── [Success] → Set telegramSent: true
│   │   │   │   └── [Failed] → Set telegramSent: false
│   │   │   └── [No] → Skip Telegram
│   │   └── Update Notification Record
│   └── [BOTH] → Execute both WEB and TELEGRAM processes
├── [Interactive Notification?]
│   ├── [Yes] → Add Response Handling
│   │   ├── Store JSON Data
│   │   ├── Set up Response Webhook
│   │   └── Enable User Actions
│   └── [No] → Standard Notification
└── End (Notification Sent)
```

---

## 🗃️ **ERD CROW'S FOOT SPECIFICATIONS**

### **Entity Definitions**

#### **Primary Entities:**

**USER (Central Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Unique Constraints**: employeeId, username, email
- **Attributes**:
  - employeeId (VARCHAR) - Format: XXX001 (ADM001, DOK001, PER001, STF001, SUP001)
  - username (VARCHAR) - Login identifier
  - email (VARCHAR) - Email address
  - password (VARCHAR) - Encrypted password
  - namaDepan (VARCHAR) - First name
  - namaBelakang (VARCHAR) - Last name
  - alamat (VARCHAR, NULLABLE) - Address
  - noHp (VARCHAR) - Phone number
  - jenisKelamin (VARCHAR) - Gender (L/P)
  - tanggalLahir (DATE) - Birth date
  - role (ENUM) - ADMIN, DOKTER, PERAWAT, STAF, SUPERVISOR
  - status (VARCHAR) - ACTIVE/INACTIVE (Default: ACTIVE)
  - telegramChatId (VARCHAR, NULLABLE) - Telegram integration
  - createdAt (TIMESTAMP) - Creation date
  - updatedAt (TIMESTAMP) - Last update

**SHIFT (Core Business Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Foreign Key**: userId → USER.id (CASCADE DELETE)
- **Attributes**:
  - tanggal (DATE) - Shift date
  - jammulai (VARCHAR) - Start time (HH:MM format)
  - jamselesai (VARCHAR) - End time (HH:MM format)
  - lokasishift (VARCHAR) - Shift location
  - lokasiEnum (ENUM) - Location enum values
  - tipeEnum (ENUM) - Shift type enum
  - tipeshift (VARCHAR, NULLABLE) - Shift type description
  - shiftNumber (INT, NULLABLE) - Shift number
  - shiftType (ENUM, NULLABLE) - Enhanced shift type
  - createdAt (TIMESTAMP) - Creation date
  - updatedAt (TIMESTAMP) - Last update

**ABSENSI (Transaction Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Foreign Keys**:
  - userId → USER.id (CASCADE DELETE)
  - shiftId → SHIFT.id (CASCADE DELETE)
- **Unique Constraint**: shiftId (One attendance per shift)
- **Attributes**:
  - jamMasuk (TIMESTAMP, NULLABLE) - Clock in time
  - jamKeluar (TIMESTAMP, NULLABLE) - Clock out time
  - status (ENUM) - HADIR, TERLAMBAT, IZIN, ALFA
  - catatan (TEXT, NULLABLE) - Notes
  - foto (VARCHAR, NULLABLE) - Photo path
  - lokasi (VARCHAR, NULLABLE) - Location
  - createdAt (TIMESTAMP) - Creation date
  - updatedAt (TIMESTAMP) - Last update

**SHIFTSWAP (Business Process Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Foreign Keys**:
  - fromUserId → USER.id (CASCADE DELETE)
  - toUserId → USER.id (CASCADE DELETE)
  - shiftId → SHIFT.id (CASCADE DELETE)
- **Unique Constraint**: shiftId (One swap per shift)
- **Attributes**:
  - status (ENUM) - Multi-level approval status
  - alasan (TEXT, NULLABLE) - Swap reason
  - tanggalSwap (DATE) - Swap date
  - rejectionReason (TEXT, NULLABLE) - Rejection reason
  - requiresUnitHead (BOOLEAN) - Requires unit head approval
  - supervisorApprovedAt (TIMESTAMP, NULLABLE) - Supervisor approval time
  - supervisorApprovedBy (INT, NULLABLE) - Supervisor ID
  - targetApprovedAt (TIMESTAMP, NULLABLE) - Target approval time
  - targetApprovedBy (INT, NULLABLE) - Target user ID
  - unitHeadApprovedAt (TIMESTAMP, NULLABLE) - Unit head approval time
  - unitHeadApprovedBy (INT, NULLABLE) - Unit head ID
  - createdAt (TIMESTAMP) - Creation date
  - updatedAt (TIMESTAMP) - Last update

**NOTIFIKASI (Enhanced Communication Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Foreign Key**: userId → USER.id (CASCADE DELETE)
- **Attributes**:
  - judul (VARCHAR) - Notification title
  - pesan (TEXT) - Notification message
  - jenis (ENUM) - Enhanced notification types (16 types)
  - status (ENUM) - UNREAD, READ, ARCHIVED (Default: UNREAD)
  - data (JSON, NULLABLE) - Rich content data
  - sentVia (VARCHAR) - Delivery channel (Default: "WEB")
  - telegramSent (BOOLEAN) - Telegram delivery status (Default: false)
  - createdAt (TIMESTAMP) - Creation date
  - updatedAt (TIMESTAMP) - Last update

**KEGIATAN (Independent Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Attributes**:
  - nama (VARCHAR) - Activity name
  - deskripsi (TEXT) - Description
  - anggaran (INT, NULLABLE) - Budget
  - catatan (TEXT, NULLABLE) - Notes
  - departemen (VARCHAR, NULLABLE) - Department
  - jenisKegiatan (VARCHAR) - Activity type
  - kapasitas (INT, NULLABLE) - Capacity
  - kontak (VARCHAR, NULLABLE) - Contact information
  - lokasi (VARCHAR) - Location
  - lokasiDetail (VARCHAR, NULLABLE) - Detailed location
  - penanggungJawab (VARCHAR) - Person in charge
  - prioritas (VARCHAR) - Priority level
  - status (VARCHAR) - Activity status
  - tanggalMulai (DATE) - Start date
  - tanggalSelesai (DATE, NULLABLE) - End date
  - targetPeserta (TEXT[]) - Target participants
  - waktuMulai (VARCHAR) - Start time
  - waktuSelesai (VARCHAR, NULLABLE) - End time
  - createdAt (TIMESTAMP) - Creation date
  - updatedAt (TIMESTAMP) - Last update

#### **System Support Entities:**

**TOKEN (Authentication Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Foreign Key**: userId → USER.id (CASCADE DELETE)
- **Unique Constraint**: token
- **Attributes**:
  - token (VARCHAR) - Unique session token
  - expiredAt (TIMESTAMP) - Expiration time
  - createdAt (TIMESTAMP) - Creation date

**LOGINLOG (Audit Entity)**

- **Primary Key**: id (INT) - Auto-increment
- **Foreign Key**: userId → USER.id (CASCADE DELETE)
- **Attributes**:
  - ipAddress (VARCHAR, NULLABLE) - IP address
  - userAgent (TEXT, NULLABLE) - Browser/app information
  - loginAt (TIMESTAMP) - Login time (Default: NOW())

### **Relationships (Crow's Foot Notation)**

#### **One-to-Many Relationships:**

1. **USER ||--o{ SHIFT**

   - One user can have many shifts
   - Each shift belongs to exactly one user
   - **Participation**: User (Mandatory), Shift (Mandatory)
   - **Cardinality**: 1:N

2. **USER ||--o{ ABSENSI**

   - One user can have many attendance records
   - Each attendance belongs to exactly one user
   - **Participation**: User (Mandatory), Absensi (Mandatory)
   - **Cardinality**: 1:N

3. **USER ||--o{ NOTIFIKASI**

   - One user can receive many notifications
   - Each notification belongs to exactly one user
   - **Participation**: User (Mandatory), Notifikasi (Mandatory)
   - **Cardinality**: 1:N

4. **USER ||--o{ TOKEN**

   - One user can have multiple active sessions
   - Each token belongs to exactly one user
   - **Participation**: User (Mandatory), Token (Mandatory)
   - **Cardinality**: 1:N

5. **USER ||--o{ LOGINLOG**
   - One user can have many login records
   - Each login log belongs to exactly one user
   - **Participation**: User (Mandatory), LoginLog (Mandatory)
   - **Cardinality**: 1:N

#### **One-to-One Relationships:**

6. **SHIFT ||--|| ABSENSI**

   - Each shift has exactly one attendance record
   - Each attendance record belongs to exactly one shift
   - **Participation**: Both Mandatory
   - **Cardinality**: 1:1

7. **SHIFT ||--o| SHIFTSWAP**
   - Each shift can have at most one swap request
   - Each swap request belongs to exactly one shift
   - **Participation**: Shift (Optional), ShiftSwap (Mandatory)
   - **Cardinality**: 1:0..1

#### **Many-to-Many Relationships (Through Junction Entity):**

8. **USER }--{ USER (via SHIFTSWAP)**
   - Users can initiate swap requests with other users
   - Users can receive swap requests from other users
   - **Junction Entity**: SHIFTSWAP
   - **Attributes**: fromUserId, toUserId, shiftId
   - **Participation**: Both Optional
   - **Cardinality**: M:N

### **ERD Visual Layout Recommendations:**

```
Positioning (Top to Bottom, Left to Right):
┌─────────────────────────────────────────────────────────┐
│                       USER                               │
│                  (Central Entity)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────┼────────┬────────┬────────────┐
         │        │        │        │            │
    ┌────▼───┐ ┌──▼───┐ ┌──▼────┐ ┌▼────────┐ ┌─▼─────┐
    │ SHIFT  │ │TOKEN │ │LOGINLOG│ │NOTIFIKASI│ │ABSENSI│
    └────┬───┘ └──────┘ └────────┘ └─────────┘ └───▲───┘
         │                                         │
    ┌────▼─────┐                                   │
    │SHIFTSWAP │                                   │
    │          │───────────────────────────────────┘
    └──────────┘

    ┌────────────┐
    │  KEGIATAN  │  (Independent Entity)
    │            │
    └────────────┘
```

### **Color Coding for ERD:**

- **Blue**: Core business entities (USER, SHIFT, ABSENSI)
- **Green**: Process entities (SHIFTSWAP, NOTIFIKASI)
- **Orange**: Event entities (KEGIATAN)
- **Gray**: System entities (TOKEN, LOGINLOG)
- **Red**: Foreign key relationships
- **Purple**: Enhanced features (JSON data, Telegram integration)

---

## 🏗️ **PHYSICAL DATA MODEL (PDM) SPECIFICATIONS**

### **Database Configuration**

**Database System**: PostgreSQL 14+  
**Character Set**: UTF-8  
**Collation**: en_US.UTF-8  
**Schema Name**: public  
**Total Tables**: 8  
**Total Enums**: 8

### **Table Creation Scripts**

#### **Enumerations:**

```sql
-- Role enumeration
CREATE TYPE "Role" AS ENUM (
    'ADMIN',
    'DOKTER',
    'PERAWAT',
    'STAF',
    'SUPERVISOR'
);

-- Attendance status enumeration
CREATE TYPE "AbsensiStatus" AS ENUM (
    'HADIR',
    'TERLAMBAT',
    'IZIN',
    'ALFA'
);

-- Shift swap status enumeration
CREATE TYPE "SwapStatus" AS ENUM (
    'PENDING',
    'APPROVED_BY_TARGET',
    'REJECTED_BY_TARGET',
    'WAITING_UNIT_HEAD',
    'REJECTED_BY_UNIT_HEAD',
    'WAITING_SUPERVISOR',
    'REJECTED_BY_SUPERVISOR',
    'APPROVED'
);

-- Location shift enumeration
CREATE TYPE "LokasiShift" AS ENUM (
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP',
    'GAWAT_DARURAT',
    'LABORATORIUM',
    'FARMASI',
    'RADIOLOGI',
    'GIZI',
    'KEAMANAN',
    'LAUNDRY',
    'CLEANING_SERVICE',
    'SUPIR',
    'ICU',
    'NICU'
);

-- Shift type enumeration
CREATE TYPE "TipeShift" AS ENUM (
    'PAGI',
    'SIANG',
    'MALAM',
    'ON_CALL',
    'JAGA'
);

-- Enhanced shift type enumeration
CREATE TYPE "ShiftType" AS ENUM (
    'GEDUNG_ADMINISTRASI',
    'RAWAT_JALAN',
    'RAWAT_INAP_3_SHIFT',
    'GAWAT_DARURAT_3_SHIFT',
    'LABORATORIUM_2_SHIFT',
    'FARMASI_2_SHIFT',
    'RADIOLOGI_2_SHIFT',
    'GIZI_2_SHIFT',
    'KEAMANAN_2_SHIFT',
    'LAUNDRY_REGULER',
    'CLEANING_SERVICE',
    'SUPIR_2_SHIFT'
);

-- Enhanced notification types
CREATE TYPE "JenisNotifikasi" AS ENUM (
    'REMINDER_SHIFT',
    'KONFIRMASI_TUKAR_SHIFT',
    'PERSETUJUAN_CUTI',
    'KEGIATAN_HARIAN',
    'ABSENSI_TERLAMBAT',
    'SHIFT_BARU_DITAMBAHKAN',
    'SISTEM_INFO',
    'PENGUMUMAN',
    'PERSONAL_REMINDER_ABSENSI',
    'TUGAS_PERSONAL',
    'HASIL_EVALUASI_PERSONAL',
    'KONFIRMASI_SHIFT_SWAP_PERSONAL',
    'PENGUMUMAN_INTERAKTIF',
    'NOTIFIKASI_DIREKTUR',
    'REMINDER_MEETING_PERSONAL',
    'PERINGATAN_PERSONAL'
);

-- Notification status enumeration
CREATE TYPE "StatusNotifikasi" AS ENUM (
    'UNREAD',
    'READ',
    'ARCHIVED'
);
```

#### **Table Definitions:**

```sql
-- Users table (Central entity)
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "employeeId" VARCHAR(10) UNIQUE NOT NULL,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "namaDepan" VARCHAR(50) NOT NULL,
    "namaBelakang" VARCHAR(50) NOT NULL,
    "alamat" TEXT,
    "noHp" VARCHAR(20) NOT NULL,
    "jenisKelamin" VARCHAR(1) NOT NULL CHECK (jenisKelamin IN ('L', 'P')),
    "tanggalLahir" DATE NOT NULL,
    "role" "Role" NOT NULL,
    "status" VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    "telegramChatId" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table (Core business entity)
CREATE TABLE "shifts" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "tanggal" DATE NOT NULL,
    "jammulai" VARCHAR(5) NOT NULL CHECK (jammulai ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    "jamselesai" VARCHAR(5) NOT NULL CHECK (jamselesai ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    "lokasishift" VARCHAR(100) NOT NULL,
    "lokasiEnum" "LokasiShift",
    "tipeEnum" "TipeShift",
    "tipeshift" VARCHAR(50),
    "shiftNumber" INTEGER,
    "shiftType" "ShiftType",
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table (Transaction entity)
CREATE TABLE "absensis" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "shiftId" INTEGER UNIQUE NOT NULL REFERENCES "shifts"("id") ON DELETE CASCADE,
    "jamMasuk" TIMESTAMP WITH TIME ZONE,
    "jamKeluar" TIMESTAMP WITH TIME ZONE,
    "status" "AbsensiStatus" NOT NULL,
    "catatan" TEXT,
    "foto" VARCHAR(255),
    "lokasi" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shift swap table (Business process entity)
CREATE TABLE "shiftswaps" (
    "id" SERIAL PRIMARY KEY,
    "fromUserId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "toUserId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "shiftId" INTEGER UNIQUE NOT NULL REFERENCES "shifts"("id") ON DELETE CASCADE,
    "status" "SwapStatus" DEFAULT 'PENDING',
    "alasan" TEXT,
    "tanggalSwap" DATE NOT NULL,
    "rejectionReason" TEXT,
    "requiresUnitHead" BOOLEAN DEFAULT FALSE,
    "supervisorApprovedAt" TIMESTAMP WITH TIME ZONE,
    "supervisorApprovedBy" INTEGER,
    "targetApprovedAt" TIMESTAMP WITH TIME ZONE,
    "targetApprovedBy" INTEGER,
    "unitHeadApprovedAt" TIMESTAMP WITH TIME ZONE,
    "unitHeadApprovedBy" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "no_self_swap" CHECK ("fromUserId" != "toUserId")
);

-- Activities table (Independent entity)
CREATE TABLE "kegiatans" (
    "id" SERIAL PRIMARY KEY,
    "nama" VARCHAR(200) NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "anggaran" INTEGER,
    "catatan" TEXT,
    "departemen" VARCHAR(100),
    "jenisKegiatan" VARCHAR(100) NOT NULL,
    "kapasitas" INTEGER,
    "kontak" VARCHAR(100),
    "lokasi" VARCHAR(200) NOT NULL,
    "lokasiDetail" TEXT,
    "penanggungJawab" VARCHAR(100) NOT NULL,
    "prioritas" VARCHAR(20) NOT NULL CHECK (prioritas IN ('RENDAH', 'SEDANG', 'TINGGI', 'URGENT')),
    "status" VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    "tanggalMulai" DATE NOT NULL,
    "tanggalSelesai" DATE,
    "targetPeserta" TEXT[],
    "waktuMulai" VARCHAR(5) NOT NULL,
    "waktuSelesai" VARCHAR(5),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authentication tokens table (System entity)
CREATE TABLE "tokens" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "token" VARCHAR(500) UNIQUE NOT NULL,
    "expiredAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login logs table (Audit entity)
CREATE TABLE "login_logs" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "ipAddress" INET,
    "userAgent" TEXT,
    "loginAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced notifications table (Communication entity)
CREATE TABLE "notifikasi" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "judul" VARCHAR(200) NOT NULL,
    "pesan" TEXT NOT NULL,
    "jenis" "JenisNotifikasi" NOT NULL,
    "status" "StatusNotifikasi" DEFAULT 'UNREAD',
    "data" JSONB,
    "sentVia" VARCHAR(20) DEFAULT 'WEB' CHECK (sentVia IN ('WEB', 'TELEGRAM', 'BOTH')),
    "telegramSent" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Indexes for Performance:**

```sql
-- Primary key indexes (automatic)
-- Users table indexes
CREATE INDEX "idx_users_employee_id" ON "users"("employeeId");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_status" ON "users"("status");

-- Shifts table indexes
CREATE INDEX "idx_shifts_user_id" ON "shifts"("userId");
CREATE INDEX "idx_shifts_tanggal" ON "shifts"("tanggal");
CREATE INDEX "idx_shifts_user_date" ON "shifts"("userId", "tanggal");
CREATE INDEX "idx_shifts_lokasi" ON "shifts"("lokasishift");

-- Attendance table indexes
CREATE INDEX "idx_absensis_user_id" ON "absensis"("userId");
CREATE INDEX "idx_absensis_shift_id" ON "absensis"("shiftId");
CREATE INDEX "idx_absensis_status" ON "absensis"("status");
CREATE INDEX "idx_absensis_created" ON "absensis"("createdAt");

-- Shift swap indexes
CREATE INDEX "idx_shiftswaps_from_user" ON "shiftswaps"("fromUserId");
CREATE INDEX "idx_shiftswaps_to_user" ON "shiftswaps"("toUserId");
CREATE INDEX "idx_shiftswaps_status" ON "shiftswaps"("status");
CREATE INDEX "idx_shiftswaps_date" ON "shiftswaps"("tanggalSwap");

-- Notifications indexes
CREATE INDEX "idx_notifikasi_user_id" ON "notifikasi"("userId");
CREATE INDEX "idx_notifikasi_status" ON "notifikasi"("status");
CREATE INDEX "idx_notifikasi_jenis" ON "notifikasi"("jenis");
CREATE INDEX "idx_notifikasi_created" ON "notifikasi"("createdAt");
CREATE INDEX "idx_notifikasi_user_status" ON "notifikasi"("userId", "status");

-- Activities indexes
CREATE INDEX "idx_kegiatans_tanggal_mulai" ON "kegiatans"("tanggalMulai");
CREATE INDEX "idx_kegiatans_status" ON "kegiatans"("status");
CREATE INDEX "idx_kegiatans_departemen" ON "kegiatans"("departemen");

-- Authentication indexes
CREATE INDEX "idx_tokens_user_id" ON "tokens"("userId");
CREATE INDEX "idx_tokens_expired" ON "tokens"("expiredAt");
CREATE INDEX "idx_login_logs_user_id" ON "login_logs"("userId");
CREATE INDEX "idx_login_logs_login_at" ON "login_logs"("loginAt");
```

### **Sample Data Volume Estimates:**

```sql
-- Typical hospital with 500 employees
-- Users: 500 records (static)
-- Shifts: 15,000 records/month (30 shifts per employee per month)
-- Attendance: 15,000 records/month (1:1 with shifts)
-- Notifications: 50,000 records/month (enhanced notification system)
-- Shift Swaps: 500 records/month (3-5% of total shifts)
-- Activities: 100 records/month
-- Tokens: 1,000 active sessions
-- Login Logs: 20,000 records/month

-- Annual growth projections:
-- Users: +10% per year
-- Shifts: +12% per year
-- Notifications: +25% per year (with enhanced features)
-- Other tables: +15% per year
```

### **Data Integrity Constraints:**

```sql
-- Additional business rule constraints
ALTER TABLE "shifts"
ADD CONSTRAINT "shift_time_logical"
CHECK (
    CASE
        WHEN jammulai < jamselesai THEN TRUE -- Same day shift
        WHEN jammulai > jamselesai THEN TRUE -- Overnight shift
        ELSE FALSE
    END
);

ALTER TABLE "absensis"
ADD CONSTRAINT "attendance_time_logical"
CHECK (
    CASE
        WHEN jamMasuk IS NULL THEN TRUE
        WHEN jamKeluar IS NULL THEN TRUE
        WHEN jamKeluar > jamMasuk THEN TRUE
        ELSE FALSE
    END
);

ALTER TABLE "kegiatans"
ADD CONSTRAINT "activity_date_logical"
CHECK (
    CASE
        WHEN tanggalSelesai IS NULL THEN TRUE
        WHEN tanggalSelesai >= tanggalMulai THEN TRUE
        ELSE FALSE
    END
);
```

### **JSON Data Structure Examples:**

```sql
-- Enhanced notification JSON data examples
-- Shift swap notification
{
    "swapId": 123,
    "originalShift": {
        "date": "2025-07-05",
        "time": "08:00-16:00",
        "location": "RAWAT_INAP"
    },
    "newShift": {
        "date": "2025-07-06",
        "time": "16:00-00:00",
        "location": "GAWAT_DARURAT"
    },
    "approvalChain": {
        "targetApproved": true,
        "unitHeadApproved": false,
        "supervisorApproved": false
    }
}

-- Personal task assignment
{
    "taskId": "TASK-2025-001",
    "priority": "TINGGI",
    "deadline": "2025-07-05T18:00:00Z",
    "location": "Room 201",
    "patientInfo": {
        "roomNumber": "201",
        "patientCode": "PT-2025-456"
    },
    "requiredActions": [
        "Check vital signs",
        "Administer medication",
        "Update patient chart"
    ]
}

-- Interactive announcement
{
    "announcementId": "ANN-2025-010",
    "type": "SURVEY",
    "title": "Staff Satisfaction Survey",
    "questions": [
        {
            "id": "Q1",
            "text": "Rate your satisfaction with current shift schedules",
            "type": "rating",
            "scale": 5
        },
        {
            "id": "Q2",
            "text": "Additional comments",
            "type": "text"
        }
    ],
    "deadline": "2025-07-10T23:59:59Z",
    "responses": []
}
```

---

## 📋 **SUMMARY & USAGE INSTRUCTIONS**

### **For Use Case Diagram:**

1. Use the actors and use cases listed above
2. Group use cases by actor using swim lanes
3. Show inheritance relationships between employee types
4. Include system boundaries for external integrations

### **For Activity Diagrams:**

1. Use the 5 main process flows provided
2. Show decision points with diamond shapes
3. Include parallel processes for notification systems
4. Add swim lanes for different user roles in approval processes

### **For ERD Crow's Foot:**

1. Place USER entity in the center
2. Use the exact relationship cardinalities specified
3. Apply the color coding suggestions
4. Show all foreign key relationships with proper crow's foot notation

### **For PDM (Physical Data Model):**

1. Use PostgreSQL-specific data types
2. Include all enumeration definitions
3. Apply the complete index strategy
4. Include all constraints and business rules

### **Key Features to Highlight:**

- **Employee ID System**: ADM001, DOK001, PER001, STF001, SUP001 format
- **Enhanced Notifications**: JSON data support with Telegram integration
- **Multi-level Approval**: Complex shift swap workflow
- **Audit Trail**: Complete login and activity logging
- **Rich Data Types**: JSON support for flexible content
- **Performance Optimization**: Comprehensive indexing strategy

**Generated on**: July 4, 2025  
**System Version**: v2.0 Enhanced Forms Integration  
**Status**: Production Ready ✅

# Database Schema Documentation for PDM & ERD

# RSUD Anugerah Hospital Management System

## Database Overview

**Database Type:** PostgreSQL  
**Schema Name:** rsud_anugerah_db  
**Total Tables:** 8  
**Total Enums:** 8  
**Total Relationships:** 15

---

## 1. ENTITIES (TABLES)

### 1.1 USER (users)

**Primary Key:** id (INT, Auto Increment)  
**Description:** Stores user information for all hospital staff

| Column Name    | Data Type  | Constraints                 | Description                                 |
| -------------- | ---------- | --------------------------- | ------------------------------------------- |
| id             | INT        | PRIMARY KEY, AUTO_INCREMENT | Unique system identifier                    |
| employeeId     | VARCHAR    | UNIQUE, NOT NULL            | Human-readable employee ID (PEG001, DOK001) |
| username       | VARCHAR    | UNIQUE, NOT NULL            | Login username                              |
| email          | VARCHAR    | UNIQUE, NOT NULL            | Email address                               |
| password       | VARCHAR    | NOT NULL                    | Encrypted password                          |
| namaDepan      | VARCHAR    | NOT NULL                    | First name                                  |
| namaBelakang   | VARCHAR    | NOT NULL                    | Last name                                   |
| alamat         | VARCHAR    | NULLABLE                    | Address                                     |
| noHp           | VARCHAR    | NOT NULL                    | Phone number                                |
| jenisKelamin   | VARCHAR    | NOT NULL                    | Gender                                      |
| tanggalLahir   | DATETIME   | NOT NULL                    | Birth date                                  |
| role           | ENUM(Role) | NOT NULL                    | User role                                   |
| status         | VARCHAR    | DEFAULT 'ACTIVE'            | Account status                              |
| createdAt      | DATETIME   | DEFAULT NOW()               | Creation timestamp                          |
| updatedAt      | DATETIME   | AUTO UPDATE                 | Last update timestamp                       |
| telegramChatId | VARCHAR    | NULLABLE                    | Telegram integration                        |

**Indexes:**

- PRIMARY: id
- UNIQUE: employeeId, username, email

**Foreign Key Relationships:**

- ONE-TO-MANY with Absensi (userId)
- ONE-TO-MANY with LoginLog (userId)
- ONE-TO-MANY with Notifikasi (userId)
- ONE-TO-MANY with Shift (userId)
- ONE-TO-MANY with ShiftSwap (fromUserId)
- ONE-TO-MANY with ShiftSwap (toUserId)
- ONE-TO-MANY with Token (userId)

### 1.2 SHIFT (shifts)

**Primary Key:** id (INT, Auto Increment)  
**Description:** Manages work shifts for hospital staff

| Column Name | Data Type         | Constraints                 | Description           |
| ----------- | ----------------- | --------------------------- | --------------------- |
| id          | INT               | PRIMARY KEY, AUTO_INCREMENT | Unique identifier     |
| tanggal     | DATETIME          | NOT NULL                    | Shift date            |
| createdAt   | DATETIME          | DEFAULT NOW()               | Creation timestamp    |
| updatedAt   | DATETIME          | AUTO UPDATE                 | Last update timestamp |
| jammulai    | VARCHAR           | NOT NULL                    | Start time (HH:MM)    |
| jamselesai  | VARCHAR           | NOT NULL                    | End time (HH:MM)      |
| lokasishift | VARCHAR           | NOT NULL                    | Shift location        |
| userId      | INT               | NOT NULL, FOREIGN KEY       | User reference        |
| lokasiEnum  | ENUM(LokasiShift) | NULLABLE                    | Location enum         |
| tipeEnum    | ENUM(TipeShift)   | NULLABLE                    | Type enum             |
| tipeshift   | VARCHAR           | NULLABLE                    | Shift type            |
| shiftNumber | INT               | NULLABLE                    | Shift number          |
| shiftType   | ENUM(ShiftType)   | NULLABLE                    | Shift type enum       |

**Indexes:**

- PRIMARY: id
- FOREIGN KEY: userId → users(id)

**Foreign Key Relationships:**

- MANY-TO-ONE with User (userId) CASCADE DELETE
- ONE-TO-ONE with Absensi (shiftId)
- ONE-TO-ONE with ShiftSwap (shiftId)
  | lokasishift | VARCHAR | NOT NULL | Shift location |
  | userId | INT | FOREIGN KEY | Reference to User |
  | lokasiEnum | ENUM(LokasiShift) | NULLABLE | Location enum |
  | tipeEnum | ENUM(TipeShift) | NULLABLE | Shift type enum |
  | tipeshift | VARCHAR | NULLABLE | Shift type description |
  | shiftNumber | INT | NULLABLE | Shift number |
  | shiftType | ENUM(ShiftType) | NULLABLE | Shift category |

**Foreign Keys:**

- userId → users.id (CASCADE DELETE)

**Indexes:**

- PRIMARY: id
- FOREIGN: userId

### 1.3 ABSENSI (absensis)

**Primary Key:** id (INT, Auto Increment)
**Description:** Tracks attendance for each shift

| Column Name | Data Type           | Constraints                 | Description           |
| ----------- | ------------------- | --------------------------- | --------------------- |
| id          | INT                 | PRIMARY KEY, AUTO_INCREMENT | Unique identifier     |
| userId      | INT                 | FOREIGN KEY                 | Reference to User     |
| shiftId     | INT                 | FOREIGN KEY, UNIQUE         | Reference to Shift    |
| jamMasuk    | DATETIME            | NULLABLE                    | Check-in time         |
| jamKeluar   | DATETIME            | NULLABLE                    | Check-out time        |
| status      | ENUM(AbsensiStatus) | NOT NULL                    | Attendance status     |
| createdAt   | DATETIME            | DEFAULT NOW()               | Creation timestamp    |
| updatedAt   | DATETIME            | AUTO UPDATE                 | Last update timestamp |
| catatan     | VARCHAR             | NULLABLE                    | Notes                 |
| foto        | VARCHAR             | NULLABLE                    | Photo evidence        |
| lokasi      | VARCHAR             | NULLABLE                    | Check-in location     |

**Foreign Keys:**

- userId → users.id (CASCADE DELETE)
- shiftId → shifts.id

**Indexes:**

- PRIMARY: id
- UNIQUE: shiftId
- FOREIGN: userId, shiftId

### 1.4 SHIFTSWAP (shiftswaps)

**Primary Key:** id (INT, Auto Increment)
**Description:** Manages shift exchange requests between users

| Column Name          | Data Type        | Constraints                 | Description              |
| -------------------- | ---------------- | --------------------------- | ------------------------ |
| id                   | INT              | PRIMARY KEY, AUTO_INCREMENT | Unique identifier        |
| fromUserId           | INT              | FOREIGN KEY                 | Requester user           |
| toUserId             | INT              | FOREIGN KEY                 | Target user              |
| shiftId              | INT              | FOREIGN KEY, UNIQUE         | Shift to swap            |
| status               | ENUM(SwapStatus) | DEFAULT 'PENDING'           | Swap status              |
| alasan               | VARCHAR          | NULLABLE                    | Reason for swap          |
| tanggalSwap          | DATETIME         | NOT NULL                    | Swap date                |
| createdAt            | DATETIME         | DEFAULT NOW()               | Creation timestamp       |
| updatedAt            | DATETIME         | AUTO UPDATE                 | Last update timestamp    |
| rejectionReason      | VARCHAR          | NULLABLE                    | Rejection reason         |
| requiresUnitHead     | BOOLEAN          | DEFAULT FALSE               | Needs unit head approval |
| supervisorApprovedAt | DATETIME         | NULLABLE                    | Supervisor approval time |
| supervisorApprovedBy | INT              | NULLABLE                    | Supervisor who approved  |
| targetApprovedAt     | DATETIME         | NULLABLE                    | Target approval time     |
| targetApprovedBy     | INT              | NULLABLE                    | Target who approved      |
| unitHeadApprovedAt   | DATETIME         | NULLABLE                    | Unit head approval time  |
| unitHeadApprovedBy   | INT              | NULLABLE                    | Unit head who approved   |

**Foreign Keys:**

- fromUserId → users.id (CASCADE DELETE)
- toUserId → users.id (CASCADE DELETE)
- shiftId → shifts.id (CASCADE DELETE)

**Indexes:**

- PRIMARY: id
- UNIQUE: shiftId
- FOREIGN: fromUserId, toUserId, shiftId

### 1.5 KEGIATAN (kegiatans)

**Primary Key:** id (INT, Auto Increment)
**Description:** Manages hospital activities and events

| Column Name     | Data Type | Constraints                 | Description           |
| --------------- | --------- | --------------------------- | --------------------- |
| id              | INT       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier     |
| nama            | VARCHAR   | NOT NULL                    | Activity name         |
| deskripsi       | VARCHAR   | NOT NULL                    | Activity description  |
| createdAt       | DATETIME  | DEFAULT NOW()               | Creation timestamp    |
| updatedAt       | DATETIME  | AUTO UPDATE                 | Last update timestamp |
| anggaran        | INT       | NULLABLE                    | Budget                |
| catatan         | VARCHAR   | NULLABLE                    | Notes                 |
| departemen      | VARCHAR   | NULLABLE                    | Department            |
| jenisKegiatan   | VARCHAR   | NOT NULL                    | Activity type         |
| kapasitas       | INT       | NULLABLE                    | Capacity              |
| kontak          | VARCHAR   | NULLABLE                    | Contact info          |
| lokasi          | VARCHAR   | NOT NULL                    | Location              |
| lokasiDetail    | VARCHAR   | NULLABLE                    | Detailed location     |
| penanggungJawab | VARCHAR   | NOT NULL                    | Person responsible    |
| prioritas       | VARCHAR   | NOT NULL                    | Priority level        |
| status          | VARCHAR   | NOT NULL                    | Activity status       |
| tanggalMulai    | DATETIME  | NOT NULL                    | Start date            |
| tanggalSelesai  | DATETIME  | NULLABLE                    | End date              |
| targetPeserta   | VARCHAR[] | NOT NULL                    | Target participants   |
| waktuMulai      | VARCHAR   | NOT NULL                    | Start time            |
| waktuSelesai    | VARCHAR   | NULLABLE                    | End time              |

**Indexes:**

- PRIMARY: id

### 1.6 TOKEN (tokens)

**Primary Key:** id (INT, Auto Increment)
**Description:** Manages authentication tokens

| Column Name | Data Type | Constraints                 | Description        |
| ----------- | --------- | --------------------------- | ------------------ |
| id          | INT       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier  |
| userId      | INT       | FOREIGN KEY                 | Reference to User  |
| token       | VARCHAR   | UNIQUE, NOT NULL            | Token value        |
| expiredAt   | DATETIME  | NOT NULL                    | Expiration time    |
| createdAt   | DATETIME  | DEFAULT NOW()               | Creation timestamp |

**Foreign Keys:**

- userId → users.id (CASCADE DELETE)

**Indexes:**

- PRIMARY: id
- UNIQUE: token
- FOREIGN: userId

### 1.7 LOGINLOG (login_logs)

**Primary Key:** id (INT, Auto Increment)
**Description:** Tracks user login activities

| Column Name | Data Type | Constraints                 | Description         |
| ----------- | --------- | --------------------------- | ------------------- |
| id          | INT       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier   |
| userId      | INT       | FOREIGN KEY                 | Reference to User   |
| ipAddress   | VARCHAR   | NULLABLE                    | Login IP address    |
| userAgent   | VARCHAR   | NULLABLE                    | Browser/device info |
| loginAt     | DATETIME  | DEFAULT NOW()               | Login timestamp     |

**Foreign Keys:**

- userId → users.id (CASCADE DELETE)

**Indexes:**

- PRIMARY: id
- FOREIGN: userId

### 1.8 NOTIFIKASI (notifikasi)

**Primary Key:** id (INT, Auto Increment)
**Description:** Manages all types of notifications including enhanced user-based notifications

| Column Name  | Data Type              | Constraints                 | Description              |
| ------------ | ---------------------- | --------------------------- | ------------------------ |
| id           | INT                    | PRIMARY KEY, AUTO_INCREMENT | Unique identifier        |
| userId       | INT                    | FOREIGN KEY                 | Reference to User        |
| judul        | VARCHAR                | NOT NULL                    | Notification title       |
| pesan        | VARCHAR                | NOT NULL                    | Notification message     |
| jenis        | ENUM(JenisNotifikasi)  | NOT NULL                    | Notification type        |
| status       | ENUM(StatusNotifikasi) | DEFAULT 'UNREAD'            | Read status              |
| data         | JSON                   | NULLABLE                    | Additional data          |
| sentVia      | VARCHAR                | DEFAULT 'WEB'               | Delivery method          |
| telegramSent | BOOLEAN                | DEFAULT FALSE               | Telegram delivery status |
| createdAt    | DATETIME               | DEFAULT NOW()               | Creation timestamp       |
| updatedAt    | DATETIME               | AUTO UPDATE                 | Last update timestamp    |

**Foreign Keys:**

- userId → users.id (CASCADE DELETE)

**Indexes:**

- PRIMARY: id
- FOREIGN: userId

---

## 2. ENUMERATIONS (ENUMS)

### 2.1 Role

**Description:** User roles in the system
**Values:**

- ADMIN - System administrator
- DOKTER - Doctor
- PERAWAT - Nurse
- STAF - Staff member
- SUPERVISOR - Supervisor

### 2.2 AbsensiStatus

**Description:** Attendance status options
**Values:**

- HADIR - Present
- TERLAMBAT - Late
- IZIN - Permitted absence
- ALFA - Absent without permission

### 2.3 SwapStatus

**Description:** Shift swap request status
**Values:**

- PENDING - Waiting for response
- APPROVED_BY_TARGET - Target user approved
- REJECTED_BY_TARGET - Target user rejected
- WAITING_UNIT_HEAD - Waiting unit head approval
- REJECTED_BY_UNIT_HEAD - Unit head rejected
- WAITING_SUPERVISOR - Waiting supervisor approval
- REJECTED_BY_SUPERVISOR - Supervisor rejected
- APPROVED - Fully approved

### 2.4 LokasiShift

**Description:** Hospital location options for shifts
**Values:**

- GEDUNG_ADMINISTRASI - Administration building
- RAWAT_JALAN - Outpatient ward
- RAWAT_INAP - Inpatient ward
- GAWAT_DARURAT - Emergency room
- LABORATORIUM - Laboratory
- FARMASI - Pharmacy
- RADIOLOGI - Radiology
- GIZI - Nutrition department
- KEAMANAN - Security
- LAUNDRY - Laundry service
- CLEANING_SERVICE - Cleaning service
- SUPIR - Driver
- ICU - Intensive Care Unit
- NICU - Neonatal ICU

### 2.5 TipeShift

**Description:** Shift type categories
**Values:**

- PAGI - Morning shift
- SIANG - Day shift
- MALAM - Night shift
- ON_CALL - On-call duty
- JAGA - Guard duty

### 2.6 ShiftType

**Description:** Detailed shift type categories
**Values:**

- GEDUNG_ADMINISTRASI - Administration building shift
- RAWAT_JALAN - Outpatient shift
- RAWAT_INAP_3_SHIFT - Inpatient 3-shift system
- GAWAT_DARURAT_3_SHIFT - Emergency 3-shift system
- LABORATORIUM_2_SHIFT - Laboratory 2-shift system
- FARMASI_2_SHIFT - Pharmacy 2-shift system
- RADIOLOGI_2_SHIFT - Radiology 2-shift system
- GIZI_2_SHIFT - Nutrition 2-shift system
- KEAMANAN_2_SHIFT - Security 2-shift system
- LAUNDRY_REGULER - Regular laundry shift
- CLEANING_SERVICE - Cleaning service shift
- SUPIR_2_SHIFT - Driver 2-shift system

### 2.7 JenisNotifikasi (Enhanced)

**Description:** Notification types including enhanced user-based notifications
**Values:**

#### Traditional Notifications:

- REMINDER_SHIFT - Shift reminder
- KONFIRMASI_TUKAR_SHIFT - Shift swap confirmation
- PERSETUJUAN_CUTI - Leave approval
- KEGIATAN_HARIAN - Daily activities
- ABSENSI_TERLAMBAT - Late attendance
- SHIFT_BARU_DITAMBAHKAN - New shift added
- SISTEM_INFO - System information
- PENGUMUMAN - Announcement

#### Enhanced User-Based Notifications:

- PERSONAL_REMINDER_ABSENSI - Personal attendance reminder
- TUGAS_PERSONAL - Personal task assignment
- HASIL_EVALUASI_PERSONAL - Personal evaluation results
- KONFIRMASI_SHIFT_SWAP_PERSONAL - Personal shift swap confirmation
- PENGUMUMAN_INTERAKTIF - Interactive announcement
- NOTIFIKASI_DIREKTUR - Director notification
- REMINDER_MEETING_PERSONAL - Personal meeting reminder
- PERINGATAN_PERSONAL - Personal warning

### 2.8 StatusNotifikasi

**Description:** Notification read status
**Values:**

- UNREAD - Not yet read
- READ - Read by user
- ARCHIVED - Archived

---

## 3. RELATIONSHIPS (FOREIGN KEYS)

### 3.1 One-to-Many Relationships

#### User → Shift (1:N)

- **Relationship:** One user can have multiple shifts
- **Foreign Key:** shifts.userId → users.id
- **Delete Rule:** CASCADE

#### User → Absensi (1:N)

- **Relationship:** One user can have multiple attendance records
- **Foreign Key:** absensis.userId → users.id
- **Delete Rule:** CASCADE

#### User → Token (1:N)

- **Relationship:** One user can have multiple tokens
- **Foreign Key:** tokens.userId → users.id
- **Delete Rule:** CASCADE

#### User → LoginLog (1:N)

- **Relationship:** One user can have multiple login logs
- **Foreign Key:** login_logs.userId → users.id
- **Delete Rule:** CASCADE

#### User → Notifikasi (1:N)

- **Relationship:** One user can have multiple notifications
- **Foreign Key:** notifikasi.userId → users.id
- **Delete Rule:** CASCADE

#### User → ShiftSwap (FromUser) (1:N)

- **Relationship:** One user can initiate multiple swap requests
- **Foreign Key:** shiftswaps.fromUserId → users.id
- **Delete Rule:** CASCADE

#### User → ShiftSwap (ToUser) (1:N)

- **Relationship:** One user can receive multiple swap requests
- **Foreign Key:** shiftswaps.toUserId → users.id
- **Delete Rule:** CASCADE

#### Shift → ShiftSwap (1:1)

- **Relationship:** One shift can have one swap request
- **Foreign Key:** shiftswaps.shiftId → shifts.id
- **Delete Rule:** CASCADE

### 3.2 One-to-One Relationships

#### Shift → Absensi (1:1)

- **Relationship:** One shift has one attendance record
- **Foreign Key:** absensis.shiftId → shifts.id
- **Constraint:** UNIQUE on shiftId

---

## 4. CONSTRAINTS AND INDEXES

### 4.1 Primary Keys

- users.id
- shifts.id
- absensis.id
- shiftswaps.id
- kegiatans.id
- tokens.id
- login_logs.id
- notifikasi.id

### 4.2 Unique Constraints

- users.username
- users.email
- absensis.shiftId
- shiftswaps.shiftId
- tokens.token

### 4.3 Foreign Key Constraints

- shifts.userId → users.id
- absensis.userId → users.id
- absensis.shiftId → shifts.id
- shiftswaps.fromUserId → users.id
- shiftswaps.toUserId → users.id
- shiftswaps.shiftId → shifts.id
- tokens.userId → users.id
- login_logs.userId → users.id
- notifikasi.userId → users.id

### 4.4 Default Values

- users.status = 'ACTIVE'
- users.createdAt = NOW()
- absensis.createdAt = NOW()
- shiftswaps.status = 'PENDING'
- shiftswaps.requiresUnitHead = FALSE
- notifikasi.status = 'UNREAD'
- notifikasi.sentVia = 'WEB'
- notifikasi.telegramSent = FALSE

---

## 5. JSON DATA STRUCTURES

### 5.1 Notifikasi.data (JSON Field)

**Description:** Stores additional notification data based on type

#### For PERSONAL_REMINDER_ABSENSI:

```json
{
  "shiftTime": "08:00",
  "location": "ICU",
  "reminderMinutes": 30
}
```

#### For TUGAS_PERSONAL:

```json
{
  "taskId": 123,
  "taskTitle": "Complete Documentation",
  "description": "Complete patient documentation",
  "dueDate": "2025-07-05T18:00:00Z",
  "priority": "HIGH",
  "assignedBy": "Dr. Smith"
}
```

#### For HASIL_EVALUASI_PERSONAL:

```json
{
  "evaluationId": 456,
  "evaluationType": "Performance Review",
  "score": 85,
  "feedback": "Good performance overall",
  "evaluatedBy": "Supervisor",
  "evaluationDate": "2025-07-01"
}
```

#### For PENGUMUMAN_INTERAKTIF:

```json
{
  "title": "Training Session",
  "content": "Voluntary training session",
  "targetRoles": ["PERAWAT", "DOKTER"],
  "interactionType": "INTEREST",
  "deadline": "2025-07-10T17:00:00Z",
  "maxParticipants": 20,
  "requiresInteraction": true
}
```

### 5.2 Kegiatan.targetPeserta (Array Field)

**Description:** Array of target participant roles

```json
["DOKTER", "PERAWAT", "ADMIN"]
```

---

## 6. BUSINESS RULES

### 6.1 User Management

- Username and email must be unique
- Users can have one role at a time
- Default status is 'ACTIVE'

### 6.2 Shift Management

- Each shift belongs to one user
- Shift times are stored as strings (HH:MM format)
- Shift locations use enum values for consistency

### 6.3 Attendance Rules

- Each shift has exactly one attendance record
- Attendance can be checked in without checking out
- Photo and location are optional for attendance

### 6.4 Shift Swap Rules

- Users can swap shifts with approval workflow
- Swap status progresses through defined stages
- Some swaps require unit head approval

### 6.5 Notification Rules

- All notifications belong to a specific user
- Notifications can be sent via WEB and/or Telegram
- Enhanced notifications support JSON data for rich content

---

## 7. DATA VOLUME ESTIMATES

### 7.1 Typical Hospital (500 employees)

- **Users:** 500 records
- **Shifts:** 15,000 records/month (30 shifts/user/month)
- **Attendance:** 15,000 records/month
- **Notifications:** 50,000 records/month
- **Shift Swaps:** 500 records/month
- **Activities:** 100 records/month

### 7.2 Growth Projections (Annual)

- **Users:** +10% per year
- **Shifts:** +12% per year
- **Notifications:** +25% per year (with enhanced features)

---

## 8. PERFORMANCE CONSIDERATIONS

### 8.1 Recommended Indexes

```sql
-- High-frequency queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_shifts_user_date ON shifts(userId, tanggal);
CREATE INDEX idx_absensis_user_id ON absensis(userId);
CREATE INDEX idx_notifikasi_user_status ON notifikasi(userId, status);
CREATE INDEX idx_notifikasi_jenis ON notifikasi(jenis);
CREATE INDEX idx_shiftswaps_status ON shiftswaps(status);

-- Date-based queries
CREATE INDEX idx_shifts_tanggal ON shifts(tanggal);
CREATE INDEX idx_notifikasi_created ON notifikasi(createdAt);
CREATE INDEX idx_login_logs_date ON login_logs(loginAt);
```

### 8.2 Partitioning Strategy

- **notifikasi:** Partition by month (createdAt)
- **login_logs:** Partition by month (loginAt)
- **absensis:** Partition by year

---

This documentation provides comprehensive information for creating accurate PDM and ERD diagrams for the RSUD Anugerah Hospital Management System database schema.

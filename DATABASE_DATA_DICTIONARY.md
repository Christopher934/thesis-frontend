# Database Data Dictionary

# RSUD Anugerah Hospital Management System

## Table of Contents

1. [Overview](#overview)
2. [Table Definitions](#table-definitions)
3. [Column Specifications](#column-specifications)
4. [Relationship Matrix](#relationship-matrix)
5. [Enumeration Values](#enumeration-values)
6. [Index Specifications](#index-specifications)
7. [Business Rules](#business-rules)

---

## Overview

**Database Name:** rsud_anugerah_db  
**Database Type:** PostgreSQL 14+  
**Character Set:** UTF-8  
**Total Tables:** 8  
**Total Enumerations:** 8  
**Total Relationships:** 15

---

## Table Definitions

### T001: users

**Purpose:** Central repository for all hospital staff information  
**Type:** Master Table  
**Estimated Records:** 500  
**Growth Rate:** 50-100 new records/year

| Column         | Type      | Length | Null | Default  | Key | Description             |
| -------------- | --------- | ------ | ---- | -------- | --- | ----------------------- |
| id             | SERIAL    | -      | N    | AUTO     | PK  | Unique user identifier  |
| username       | VARCHAR   | 50     | N    | -        | UK  | Unique login username   |
| email          | VARCHAR   | 100    | N    | -        | UK  | Unique email address    |
| password       | VARCHAR   | 255    | N    | -        | -   | BCrypt hashed password  |
| namaDepan      | VARCHAR   | 50     | N    | -        | -   | First name              |
| namaBelakang   | VARCHAR   | 50     | N    | -        | -   | Last name               |
| alamat         | VARCHAR   | 255    | Y    | NULL     | -   | Complete address        |
| noHp           | VARCHAR   | 20     | N    | -        | -   | Phone number            |
| jenisKelamin   | VARCHAR   | 1      | N    | -        | -   | Gender (L/P)            |
| tanggalLahir   | TIMESTAMP | -      | N    | -        | -   | Date of birth           |
| role           | Role ENUM | -      | N    | -        | -   | User role in system     |
| status         | VARCHAR   | 20     | N    | 'ACTIVE' | -   | Account status          |
| createdAt      | TIMESTAMP | -      | N    | NOW()    | -   | Record creation time    |
| updatedAt      | TIMESTAMP | -      | N    | NOW()    | -   | Last update time        |
| telegramChatId | VARCHAR   | 50     | Y    | NULL     | -   | Telegram integration ID |

**Business Rules:**

- Username must be unique across all users
- Email must be valid format and unique
- Password must be BCrypt hashed with minimum 8 characters
- Role determines system access permissions
- Status can be: ACTIVE, INACTIVE, SUSPENDED

### T002: shifts

**Purpose:** Work shift scheduling and management  
**Type:** Transaction Table  
**Estimated Records:** 45,000/year  
**Growth Rate:** 180-200 records/day

| Column      | Type        | Length | Null | Default | Key | Description                |
| ----------- | ----------- | ------ | ---- | ------- | --- | -------------------------- |
| id          | SERIAL      | -      | N    | AUTO    | PK  | Unique shift identifier    |
| tanggal     | TIMESTAMP   | -      | N    | -       | -   | Shift date                 |
| createdAt   | TIMESTAMP   | -      | N    | NOW()   | -   | Record creation time       |
| updatedAt   | TIMESTAMP   | -      | N    | NOW()   | -   | Last update time           |
| idpegawai   | VARCHAR     | 20     | N    | -       | -   | Employee ID reference      |
| jammulai    | VARCHAR     | 5      | N    | -       | -   | Start time (HH:MM)         |
| jamselesai  | VARCHAR     | 5      | N    | -       | -   | End time (HH:MM)           |
| lokasishift | VARCHAR     | 100    | N    | -       | -   | Shift location description |
| userId      | INTEGER     | -      | N    | -       | FK  | Reference to users table   |
| lokasiEnum  | LokasiShift | -      | Y    | NULL    | -   | Standardized location      |
| tipeEnum    | TipeShift   | -      | Y    | NULL    | -   | Shift type classification  |
| tipeshift   | VARCHAR     | 20     | Y    | NULL    | -   | Additional shift type info |
| shiftNumber | INTEGER     | -      | Y    | NULL    | -   | Shift sequence number      |
| shiftType   | ShiftType   | -      | Y    | NULL    | -   | Comprehensive shift type   |

**Business Rules:**

- Each shift must be assigned to exactly one user
- Start time must be before end time
- Shift date cannot be more than 6 months in the future
- Location must be valid hospital department

### T003: absensis

**Purpose:** Attendance tracking for all shifts  
**Type:** Transaction Table  
**Estimated Records:** 45,000/year (1:1 with shifts)  
**Growth Rate:** Same as shifts

| Column    | Type          | Length | Null | Default | Key   | Description                  |
| --------- | ------------- | ------ | ---- | ------- | ----- | ---------------------------- |
| id        | SERIAL        | -      | N    | AUTO    | PK    | Unique attendance identifier |
| userId    | INTEGER       | -      | N    | -       | FK    | Reference to users table     |
| shiftId   | INTEGER       | -      | N    | -       | FK,UK | Reference to shifts table    |
| jamMasuk  | TIMESTAMP     | -      | Y    | NULL    | -     | Actual check-in time         |
| jamKeluar | TIMESTAMP     | -      | Y    | NULL    | -     | Actual check-out time        |
| status    | AbsensiStatus | -      | N    | -       | -     | Attendance status            |
| createdAt | TIMESTAMP     | -      | N    | NOW()   | -     | Record creation time         |
| updatedAt | TIMESTAMP     | -      | N    | NOW()   | -     | Last update time             |
| catatan   | VARCHAR       | 500    | Y    | NULL    | -     | Additional notes             |
| foto      | VARCHAR       | 255    | Y    | NULL    | -     | Photo evidence path          |
| lokasi    | VARCHAR       | 100    | Y    | NULL    | -     | Check-in location            |

**Business Rules:**

- One attendance record per shift (enforced by unique constraint)
- Check-in time must be before check-out time
- Photo evidence required for late arrivals
- Status automatically calculated based on time vs schedule

### T004: shiftswaps

**Purpose:** Shift exchange request management  
**Type:** Process Table  
**Estimated Records:** 2,000/year  
**Growth Rate:** 5-10 requests/day

| Column               | Type       | Length | Null | Default | Key   | Description               |
| -------------------- | ---------- | ------ | ---- | ------- | ----- | ------------------------- |
| id                   | SERIAL     | -      | N    | AUTO    | PK    | Unique swap identifier    |
| fromUserId           | INTEGER    | -      | N    | -       | FK    | Requesting user           |
| toUserId             | INTEGER    | -      | N    | -       | FK    | Target user               |
| shiftId              | INTEGER    | -      | N    | -       | FK,UK | Shift to be swapped       |
| status               | SwapStatus | -      | N    | PENDING | -     | Current swap status       |
| alasan               | VARCHAR    | 500    | Y    | NULL    | -     | Reason for swap request   |
| tanggalSwap          | TIMESTAMP  | -      | N    | -       | -     | Proposed swap date        |
| createdAt            | TIMESTAMP  | -      | N    | NOW()   | -     | Request creation time     |
| updatedAt            | TIMESTAMP  | -      | N    | NOW()   | -     | Last status update        |
| rejectionReason      | VARCHAR    | 500    | Y    | NULL    | -     | Reason for rejection      |
| requiresUnitHead     | BOOLEAN    | -      | N    | FALSE   | -     | Unit head approval needed |
| supervisorApprovedAt | TIMESTAMP  | -      | Y    | NULL    | -     | Supervisor approval time  |
| supervisorApprovedBy | INTEGER    | -      | Y    | NULL    | -     | Approving supervisor ID   |
| targetApprovedAt     | TIMESTAMP  | -      | Y    | NULL    | -     | Target approval time      |
| targetApprovedBy     | INTEGER    | -      | Y    | NULL    | -     | Approving target ID       |
| unitHeadApprovedAt   | TIMESTAMP  | -      | Y    | NULL    | -     | Unit head approval time   |
| unitHeadApprovedBy   | INTEGER    | -      | Y    | NULL    | -     | Approving unit head ID    |

**Business Rules:**

- User cannot swap shift with themselves
- Only one active swap request per shift
- Approval workflow: Target → Unit Head (if required) → Supervisor
- Swap request expires after 48 hours if no response

### T005: kegiatans

**Purpose:** Hospital activities and events management  
**Type:** Master Table  
**Estimated Records:** 500/year  
**Growth Rate:** 1-2 activities/day

| Column          | Type      | Length | Null | Default | Key | Description                |
| --------------- | --------- | ------ | ---- | ------- | --- | -------------------------- |
| id              | SERIAL    | -      | N    | AUTO    | PK  | Unique activity identifier |
| nama            | VARCHAR   | 200    | N    | -       | -   | Activity name              |
| deskripsi       | TEXT      | -      | N    | -       | -   | Detailed description       |
| createdAt       | TIMESTAMP | -      | N    | NOW()   | -   | Record creation time       |
| updatedAt       | TIMESTAMP | -      | N    | NOW()   | -   | Last update time           |
| anggaran        | INTEGER   | -      | Y    | NULL    | -   | Budget allocation          |
| catatan         | TEXT      | -      | Y    | NULL    | -   | Additional notes           |
| departemen      | VARCHAR   | 100    | Y    | NULL    | -   | Organizing department      |
| jenisKegiatan   | VARCHAR   | 50     | N    | -       | -   | Activity category          |
| kapasitas       | INTEGER   | -      | Y    | NULL    | -   | Maximum participants       |
| kontak          | VARCHAR   | 100    | Y    | NULL    | -   | Contact information        |
| lokasi          | VARCHAR   | 200    | N    | -       | -   | Activity location          |
| lokasiDetail    | VARCHAR   | 500    | Y    | NULL    | -   | Detailed location info     |
| penanggungJawab | VARCHAR   | 100    | N    | -       | -   | Person responsible         |
| prioritas       | VARCHAR   | 20     | N    | -       | -   | Priority level             |
| status          | VARCHAR   | 20     | N    | -       | -   | Current status             |
| tanggalMulai    | TIMESTAMP | -      | N    | -       | -   | Start date and time        |
| tanggalSelesai  | TIMESTAMP | -      | Y    | NULL    | -   | End date and time          |
| targetPeserta   | VARCHAR[] | -      | N    | -       | -   | Target participant roles   |
| waktuMulai      | VARCHAR   | 5      | N    | -       | -   | Start time (HH:MM)         |
| waktuSelesai    | VARCHAR   | 5      | Y    | NULL    | -   | End time (HH:MM)           |

**Business Rules:**

- Activity name must be unique per month
- Start date cannot be in the past
- End date must be after start date
- Capacity must be positive number if specified

### T006: tokens

**Purpose:** Authentication token management  
**Type:** System Table  
**Estimated Records:** 1,000 active  
**Growth Rate:** High turnover (daily refresh)

| Column    | Type      | Length | Null | Default | Key | Description              |
| --------- | --------- | ------ | ---- | ------- | --- | ------------------------ |
| id        | SERIAL    | -      | N    | AUTO    | PK  | Unique token identifier  |
| userId    | INTEGER   | -      | N    | -       | FK  | Reference to users table |
| token     | VARCHAR   | 255    | N    | -       | UK  | JWT token string         |
| expiredAt | TIMESTAMP | -      | N    | -       | -   | Token expiration time    |
| createdAt | TIMESTAMP | -      | N    | NOW()   | -   | Token creation time      |

**Business Rules:**

- Token must be unique across all active tokens
- Expired tokens should be automatically purged
- Maximum 5 active tokens per user
- Token expires after 24 hours

### T007: login_logs

**Purpose:** User login activity tracking  
**Type:** Audit Table  
**Estimated Records:** 50,000/year  
**Growth Rate:** 100-200 logins/day

| Column    | Type      | Length | Null | Default | Key | Description                |
| --------- | --------- | ------ | ---- | ------- | --- | -------------------------- |
| id        | SERIAL    | -      | N    | AUTO    | PK  | Unique log identifier      |
| userId    | INTEGER   | -      | N    | -       | FK  | Reference to users table   |
| ipAddress | VARCHAR   | 45     | Y    | NULL    | -   | Client IP address          |
| userAgent | VARCHAR   | 500    | Y    | NULL    | -   | Browser/device information |
| loginAt   | TIMESTAMP | -      | N    | NOW()   | -   | Login timestamp            |

**Business Rules:**

- All login attempts should be logged
- IP address stored for security analysis
- Logs retained for 1 year minimum
- Suspicious login patterns trigger alerts

### T008: notifikasi

**Purpose:** System-wide notification management  
**Type:** Transaction Table  
**Estimated Records:** 200,000/year  
**Growth Rate:** 500-1000 notifications/day

| Column       | Type             | Length | Null | Default | Key | Description                    |
| ------------ | ---------------- | ------ | ---- | ------- | --- | ------------------------------ |
| id           | SERIAL           | -      | N    | AUTO    | PK  | Unique notification identifier |
| userId       | INTEGER          | -      | N    | -       | FK  | Target user                    |
| judul        | VARCHAR          | 200    | N    | -       | -   | Notification title             |
| pesan        | TEXT             | -      | N    | -       | -   | Message content                |
| jenis        | JenisNotifikasi  | -      | N    | -       | -   | Notification type              |
| status       | StatusNotifikasi | -      | N    | UNREAD  | -   | Read status                    |
| data         | JSONB            | -      | Y    | NULL    | -   | Additional structured data     |
| sentVia      | VARCHAR          | 10     | N    | WEB     | -   | Delivery channel               |
| telegramSent | BOOLEAN          | -      | N    | FALSE   | -   | Telegram delivery status       |
| createdAt    | TIMESTAMP        | -      | N    | NOW()   | -   | Notification creation time     |
| updatedAt    | TIMESTAMP        | -      | N    | NOW()   | -   | Last update time               |

**Business Rules:**

- All notifications must target specific users
- JSONB data field allows flexible content structure
- Enhanced types support user-based targeting
- Notifications auto-archived after 30 days if read

---

## Relationship Matrix

| Parent Table | Child Table | Relationship | Cardinality | Cascade  |
| ------------ | ----------- | ------------ | ----------- | -------- |
| users        | shifts      | userId       | 1:N         | DELETE   |
| users        | absensis    | userId       | 1:N         | DELETE   |
| users        | notifikasi  | userId       | 1:N         | DELETE   |
| users        | tokens      | userId       | 1:N         | DELETE   |
| users        | login_logs  | userId       | 1:N         | DELETE   |
| users        | shiftswaps  | fromUserId   | 1:N         | DELETE   |
| users        | shiftswaps  | toUserId     | 1:N         | DELETE   |
| shifts       | absensis    | shiftId      | 1:1         | RESTRICT |
| shifts       | shiftswaps  | shiftId      | 1:0..1      | DELETE   |

**Relationship Rules:**

- All user-related data cascades on user deletion
- Shift-attendance relationship protected (cannot delete shift with attendance)
- Shift-swap relationship allows cascade deletion

---

## Enumeration Values

### Role

| Value      | Description           | System Access                    |
| ---------- | --------------------- | -------------------------------- |
| ADMIN      | System Administrator  | Full access to all modules       |
| DOKTER     | Medical Doctor        | Medical records, scheduling      |
| PERAWAT    | Nurse                 | Patient care, basic scheduling   |
| STAF       | General Staff         | Limited departmental access      |
| SUPERVISOR | Department Supervisor | Department management, approvals |

### AbsensiStatus

| Value     | Description          | Impact              |
| --------- | -------------------- | ------------------- |
| HADIR     | Present              | Normal attendance   |
| TERLAMBAT | Late arrival         | Attendance penalty  |
| IZIN      | Authorized absence   | Approved leave      |
| ALFA      | Unauthorized absence | Disciplinary action |

### SwapStatus

| Value                  | Description         | Next State                                 |
| ---------------------- | ------------------- | ------------------------------------------ |
| PENDING                | Initial request     | APPROVED_BY_TARGET / REJECTED_BY_TARGET    |
| APPROVED_BY_TARGET     | Target accepted     | WAITING_UNIT_HEAD / WAITING_SUPERVISOR     |
| REJECTED_BY_TARGET     | Target declined     | Terminal state                             |
| WAITING_UNIT_HEAD      | Awaiting unit head  | REJECTED_BY_UNIT_HEAD / WAITING_SUPERVISOR |
| REJECTED_BY_UNIT_HEAD  | Unit head declined  | Terminal state                             |
| WAITING_SUPERVISOR     | Awaiting supervisor | REJECTED_BY_SUPERVISOR / APPROVED          |
| REJECTED_BY_SUPERVISOR | Supervisor declined | Terminal state                             |
| APPROVED               | Final approval      | Terminal state                             |

### JenisNotifikasi (Enhanced)

| Value                          | Category | Description                     | Target        |
| ------------------------------ | -------- | ------------------------------- | ------------- |
| REMINDER_SHIFT                 | Standard | Shift reminders                 | Role-based    |
| KONFIRMASI_TUKAR_SHIFT         | Standard | Shift swap confirmations        | Role-based    |
| PERSETUJUAN_CUTI               | Standard | Leave approvals                 | Role-based    |
| KEGIATAN_HARIAN                | Standard | Daily activities                | Role-based    |
| ABSENSI_TERLAMBAT              | Standard | Late attendance alerts          | Role-based    |
| SHIFT_BARU_DITAMBAHKAN         | Standard | New shift notifications         | Role-based    |
| SISTEM_INFO                    | Standard | System information              | Role-based    |
| PENGUMUMAN                     | Standard | General announcements           | Role-based    |
| PERSONAL_REMINDER_ABSENSI      | Enhanced | Personal attendance reminders   | User-specific |
| TUGAS_PERSONAL                 | Enhanced | Individual task assignments     | User-specific |
| HASIL_EVALUASI_PERSONAL        | Enhanced | Personal evaluation results     | User-specific |
| KONFIRMASI_SHIFT_SWAP_PERSONAL | Enhanced | Direct shift swap confirmations | User-specific |
| PENGUMUMAN_INTERAKTIF          | Enhanced | Interactive announcements       | User-specific |
| NOTIFIKASI_DIREKTUR            | Enhanced | Executive communications        | User-specific |
| REMINDER_MEETING_PERSONAL      | Enhanced | Personal meeting reminders      | User-specific |
| PERINGATAN_PERSONAL            | Enhanced | Personal warnings               | User-specific |

---

## Index Specifications

### Primary Indexes (Automatic)

- users.id (BTREE, UNIQUE)
- shifts.id (BTREE, UNIQUE)
- absensis.id (BTREE, UNIQUE)
- shiftswaps.id (BTREE, UNIQUE)
- kegiatans.id (BTREE, UNIQUE)
- tokens.id (BTREE, UNIQUE)
- login_logs.id (BTREE, UNIQUE)
- notifikasi.id (BTREE, UNIQUE)

### Unique Indexes

- users.username (BTREE, UNIQUE)
- users.email (BTREE, UNIQUE)
- tokens.token (BTREE, UNIQUE)
- absensis.shiftId (BTREE, UNIQUE)
- shiftswaps.shiftId (BTREE, UNIQUE)

### Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_shifts_user_date ON shifts(userId, tanggal);
CREATE INDEX idx_absensis_user_status ON absensis(userId, status);
CREATE INDEX idx_notifikasi_user_status ON notifikasi(userId, status);
CREATE INDEX idx_shiftswaps_status ON shiftswaps(status);
CREATE INDEX idx_login_logs_user_date ON login_logs(userId, loginAt);

-- JSONB indexes for notification data
CREATE INDEX idx_notifikasi_data_gin ON notifikasi USING GIN(data);

-- Date range indexes
CREATE INDEX idx_shifts_date_range ON shifts(tanggal) WHERE tanggal >= CURRENT_DATE;
CREATE INDEX idx_kegiatans_date_range ON kegiatans(tanggalMulai, tanggalSelesai);
```

---

## Business Rules

### Data Integrity Rules

1. **User Management**

   - Username and email must be globally unique
   - Password must be encrypted using BCrypt
   - User status changes require supervisor approval

2. **Shift Scheduling**

   - Shifts cannot overlap for the same user
   - Minimum 8-hour gap between consecutive shifts
   - Maximum 12-hour shift duration

3. **Attendance Tracking**

   - Check-in required within 30 minutes of shift start
   - Check-out required within 30 minutes of shift end
   - Photo evidence mandatory for late check-ins

4. **Shift Swapping**

   - Swap requests must be initiated at least 24 hours before shift
   - Same role level required for swap approval
   - Maximum 2 pending swap requests per user

5. **Notification System**
   - All notifications must have valid user targets
   - Enhanced notifications support rich JSON data
   - Automatic archival after 30 days for read notifications

### Security Rules

1. **Authentication**

   - Password minimum 8 characters with mixed case and numbers
   - Session timeout after 8 hours of inactivity
   - Maximum 3 failed login attempts before account lock

2. **Authorization**

   - Role-based access control (RBAC)
   - API endpoint protection with JWT tokens
   - Audit trail for all administrative actions

3. **Data Protection**
   - Sensitive data encryption at rest
   - PII data masking in logs
   - Regular backup and disaster recovery procedures

### Performance Rules

1. **Database Optimization**

   - Query execution time must be < 2 seconds
   - Index maintenance during off-peak hours
   - Partition large tables by date ranges

2. **Application Performance**
   - API response time < 500ms for standard operations
   - Real-time notifications delivered within 5 seconds
   - File uploads limited to 10MB per transaction

This comprehensive data dictionary provides all necessary information for database implementation, maintenance, and documentation purposes for the RSUD Anugerah Hospital Management System.

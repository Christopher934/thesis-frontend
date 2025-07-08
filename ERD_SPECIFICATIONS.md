# Entity Relationship Diagram (ERD) Specifications

# RSUD Anugerah Hospital Management System

## ERD Components Overview

### 1. ENTITIES AND ATTRIBUTES

#### 1.1 Primary Entities

**USER** (Central Entity)

- **PK:** id (INT)
- **Attributes:** username*, email*, password, namaDepan, namaBelakang, alamat, noHp, jenisKelamin, tanggalLahir, role, status, createdAt, updatedAt, telegramChatId
- **Domain:** All hospital staff members
- **Cardinality:** ~500 records

**SHIFT** (Core Business Entity)

- **PK:** id (INT)
- **FK:** userId → USER.id
- **Attributes:** tanggal, idpegawai, jammulai, jamselesai, lokasishift, lokasiEnum, tipeEnum, tipeshift, shiftNumber, shiftType, createdAt, updatedAt
- **Domain:** Work shift assignments
- **Cardinality:** ~45,000 records/year

**ABSENSI** (Transaction Entity)

- **PK:** id (INT)
- **FK:** userId → USER.id, shiftId → SHIFT.id
- **Attributes:** jamMasuk, jamKeluar, status, catatan, foto, lokasi, createdAt, updatedAt
- **Domain:** Attendance records
- **Cardinality:** 1:1 with SHIFT

**SHIFTSWAP** (Business Process Entity)

- **PK:** id (INT)
- **FK:** fromUserId → USER.id, toUserId → USER.id, shiftId → SHIFT.id
- **Attributes:** status, alasan, tanggalSwap, rejectionReason, requiresUnitHead, supervisorApprovedAt, supervisorApprovedBy, targetApprovedAt, targetApprovedBy, unitHeadApprovedAt, unitHeadApprovedBy, createdAt, updatedAt
- **Domain:** Shift exchange requests
- **Cardinality:** ~2,000 records/year

**NOTIFIKASI** (Communication Entity)

- **PK:** id (INT)
- **FK:** userId → USER.id
- **Attributes:** judul, pesan, jenis, status, data, sentVia, telegramSent, createdAt, updatedAt
- **Domain:** System notifications
- **Cardinality:** ~200,000 records/year (high volume)

**KEGIATAN** (Event Entity)

- **PK:** id (INT)
- **Attributes:** nama, deskripsi, anggaran, catatan, departemen, jenisKegiatan, kapasitas, kontak, lokasi, lokasiDetail, penanggungJawab, prioritas, status, tanggalMulai, tanggalSelesai, targetPeserta, waktuMulai, waktuSelesai, createdAt, updatedAt
- **Domain:** Hospital activities
- **Cardinality:** ~500 records/year

**TOKEN** (System Entity)

- **PK:** id (INT)
- **FK:** userId → USER.id
- **Attributes:** token\*, expiredAt, createdAt
- **Domain:** Authentication tokens
- **Cardinality:** ~1,000 active sessions

**LOGINLOG** (Audit Entity)

- **PK:** id (INT)
- **FK:** userId → USER.id
- **Attributes:** ipAddress, userAgent, loginAt
- **Domain:** Login tracking
- **Cardinality:** ~50,000 records/year

### 2. RELATIONSHIPS SPECIFICATION

#### 2.1 Strong Relationships (Identifying)

**USER ←→ SHIFT** (1:N)

- **Type:** Identifying relationship
- **Cardinality:** One user can have many shifts
- **Constraints:** CASCADE DELETE
- **Business Rule:** Each shift must be assigned to exactly one user

**SHIFT ←→ ABSENSI** (1:1)

- **Type:** Identifying relationship
- **Cardinality:** Each shift has exactly one attendance record
- **Constraints:** UNIQUE on shiftId
- **Business Rule:** Attendance is mandatory for all shifts

**SHIFT ←→ SHIFTSWAP** (1:0..1)

- **Type:** Identifying relationship
- **Cardinality:** Each shift can have at most one active swap request
- **Constraints:** UNIQUE on shiftId, CASCADE DELETE
- **Business Rule:** No overlapping swap requests allowed

#### 2.2 Non-Identifying Relationships

**USER ←→ ABSENSI** (1:N)

- **Type:** Non-identifying relationship
- **Cardinality:** One user can have many attendance records
- **Constraints:** CASCADE DELETE
- **Business Rule:** User attendance history tracking

**USER ←→ NOTIFIKASI** (1:N)

- **Type:** Non-identifying relationship
- **Cardinality:** One user can receive many notifications
- **Constraints:** CASCADE DELETE
- **Business Rule:** All notifications must be targeted to specific users

**USER ←→ TOKEN** (1:N)

- **Type:** Non-identifying relationship
- **Cardinality:** One user can have multiple active sessions
- **Constraints:** CASCADE DELETE
- **Business Rule:** Session management and security

**USER ←→ LOGINLOG** (1:N)

- **Type:** Non-identifying relationship
- **Cardinality:** One user can have many login records
- **Constraints:** CASCADE DELETE
- **Business Rule:** Audit trail for security

#### 2.3 Complex Relationships

**SHIFTSWAP Multi-User Relationship**

- **fromUserId** → USER.id (Requesting user)
- **toUserId** → USER.id (Target user)
- **Type:** M:N through SHIFTSWAP entity
- **Business Rule:** User cannot swap with themselves
- **Approval Workflow:** Target → Unit Head → Supervisor

### 3. ATTRIBUTE SPECIFICATIONS

#### 3.1 Primary Keys

- All entities use SERIAL INTEGER primary keys
- Auto-incrementing for guaranteed uniqueness
- Indexed automatically for performance

#### 3.2 Foreign Keys

- All foreign keys enforce referential integrity
- CASCADE DELETE on user relationships
- RESTRICT/NO ACTION on critical business relationships

#### 3.3 Unique Constraints

- USER: username, email (business uniqueness)
- TOKEN: token (security requirement)
- ABSENSI: shiftId (business rule - one attendance per shift)
- SHIFTSWAP: shiftId (business rule - one swap per shift)

#### 3.4 Check Constraints (Application Level)

- User role validation against Role enum
- Attendance status validation against AbsensiStatus enum
- Shift swap status validation against SwapStatus enum
- Date/time logical validation (start < end times)

### 4. DOMAIN SPECIFICATIONS

#### 4.1 Enumerated Domains

**Role Domain**

```
ADMIN          - Full system access
DOKTER         - Medical staff privileges
PERAWAT        - Nursing staff privileges
STAF           - General staff privileges
SUPERVISOR     - Department management privileges
```

**AbsensiStatus Domain**

```
HADIR          - Present and on time
TERLAMBAT      - Present but late
IZIN           - Authorized absence
ALFA           - Unauthorized absence
```

**SwapStatus Domain** (Workflow States)

```
PENDING                 → Initial request state
APPROVED_BY_TARGET     → Target user acceptance
REJECTED_BY_TARGET     → Target user rejection
WAITING_UNIT_HEAD      → Awaiting unit head approval
REJECTED_BY_UNIT_HEAD  → Unit head rejection
WAITING_SUPERVISOR     → Awaiting supervisor approval
REJECTED_BY_SUPERVISOR → Supervisor rejection
APPROVED               → Final approval state
```

**JenisNotifikasi Domain** (Enhanced)

```
// Standard Notifications
REMINDER_SHIFT, KONFIRMASI_TUKAR_SHIFT, PERSETUJUAN_CUTI
KEGIATAN_HARIAN, ABSENSI_TERLAMBAT, SHIFT_BARU_DITAMBAHKAN
SISTEM_INFO, PENGUMUMAN

// Enhanced User-Based Notifications
PERSONAL_REMINDER_ABSENSI      - Individual attendance reminders
TUGAS_PERSONAL                 - Direct task assignments
HASIL_EVALUASI_PERSONAL        - Personal evaluation results
KONFIRMASI_SHIFT_SWAP_PERSONAL - User-to-user shift confirmations
PENGUMUMAN_INTERAKTIF          - Interactive announcements
NOTIFIKASI_DIREKTUR            - Executive level communications
REMINDER_MEETING_PERSONAL      - Personal meeting reminders
PERINGATAN_PERSONAL            - Disciplinary notices
```

#### 4.2 JSON Domain (NOTIFIKASI.data)

```json
// Enhanced notification data structure examples:

// Personal Task Assignment
{
  "taskId": "T001",
  "priority": "HIGH|MEDIUM|LOW",
  "deadline": "ISO-8601 timestamp",
  "assignedBy": "user identifier",
  "description": "task description",
  "attachments": ["file paths"],
  "relatedShift": "shift reference"
}

// Interactive Announcement
{
  "requiresResponse": true,
  "responseDeadline": "ISO-8601 timestamp",
  "options": ["INTERESTED", "NOT_AVAILABLE", "NEED_MORE_INFO"],
  "responseData": {
    "userId": "responding user id",
    "response": "selected option",
    "responseAt": "ISO-8601 timestamp",
    "comments": "optional user comments"
  },
  "metadata": {
    "eventId": "related event id",
    "department": "target department"
  }
}

// Shift Swap Confirmation
{
  "swapId": "shiftswap reference",
  "originalShift": {
    "date": "shift date",
    "time": "time range",
    "location": "shift location"
  },
  "newShift": {
    "date": "shift date",
    "time": "time range",
    "location": "shift location"
  },
  "approvalChain": {
    "targetApproved": "boolean",
    "unitHeadApproved": "boolean",
    "supervisorApproved": "boolean"
  }
}
```

### 5. ERD VISUAL LAYOUT RECOMMENDATIONS

#### 5.1 Entity Positioning

```
Top Level:    USER (central entity)
Second Level: SHIFT, NOTIFIKASI (primary business entities)
Third Level:  ABSENSI, SHIFTSWAP (dependent entities)
Fourth Level: TOKEN, LOGINLOG (system entities)
Independent:  KEGIATAN (standalone entity)
```

#### 5.2 Relationship Lines

- **Thick Lines:** Strong identifying relationships
- **Thin Lines:** Non-identifying relationships
- **Dashed Lines:** Optional relationships
- **Crow's Foot:** Many side of relationship
- **Single Line:** One side of relationship
- **Circle:** Optional participation
- **Double Line:** Mandatory participation

#### 5.3 Color Coding Suggestions

- **Blue:** Core business entities (USER, SHIFT, ABSENSI)
- **Green:** Process entities (SHIFTSWAP, NOTIFIKASI)
- **Orange:** Event entities (KEGIATAN)
- **Gray:** System entities (TOKEN, LOGINLOG)
- **Red:** Foreign key relationships
- **Purple:** Enhanced user-based notification features

### 6. BUSINESS RULES VISUALIZATION

#### 6.1 Constraint Annotations

- **Unique constraints:** ⚫ symbol next to attribute
- **Foreign keys:** → arrow with relationship line
- **Required fields:** Bold attribute names
- **Optional fields:** Italic attribute names
- **Calculated fields:** [C] prefix
- **Audit fields:** [A] prefix (createdAt, updatedAt)

#### 6.2 Cardinality Indicators

```
1:1   - One-to-one (SHIFT ←→ ABSENSI)
1:N   - One-to-many (USER ←→ SHIFT)
0..1  - Zero or one (SHIFT ←→ SHIFTSWAP)
1..N  - One or more (USER ←→ NOTIFIKASI)
0..N  - Zero or more (optional relationships)
```

### 7. ENHANCED FEATURES HIGHLIGHTING

#### 7.1 User-Based Notification Enhancements

- **New notification types** highlighted in different color
- **JSON data field** shown with expanded content examples
- **Interactive response flow** depicted with process arrows
- **Role-based targeting** shown with conditional relationships

#### 7.2 Modern Features

- **JSONB data support** for flexible notification content
- **Telegram integration** through telegramChatId and telegramSent
- **Multi-level approval workflows** in shift swaps
- **Audit trail capabilities** through comprehensive logging
- **Enhanced user targeting** through personal notification types

### 8. TECHNICAL NOTES FOR ERD TOOLS

#### 8.1 ERD Tool Settings

- **Database Type:** PostgreSQL
- **Naming Convention:** snake_case for tables, camelCase for attributes
- **Primary Key Generation:** SERIAL (auto-increment)
- **Foreign Key Actions:** CASCADE DELETE for user relationships
- **Index Generation:** Automatic for PKs, manual for performance indexes

#### 8.2 Export Formats

- **Physical ERD:** Shows actual database implementation
- **Logical ERD:** Shows business relationships without implementation details
- **Conceptual ERD:** High-level business entity overview

#### 8.3 Documentation Integration

- Link ERD to data dictionary
- Include business rule annotations
- Cross-reference with API documentation
- Maintain version control for schema changes

This specification provides comprehensive guidance for creating detailed ERDs that accurately represent the RSUD Anugerah Hospital Management System's enhanced database structure with user-based notification capabilities.

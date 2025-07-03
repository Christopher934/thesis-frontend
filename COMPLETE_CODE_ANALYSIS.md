# 📚 RSUD Anugerah Hospital Management System - Complete Code Analysis

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

### **Multi-Tier Architecture**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RSUD ANUGERAH SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  Backend (NestJS)  │  Database │  External APIs  │
│      Port 3000       │     Port 3001      │PostgreSQL │   Telegram Bot  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **PROJECT PURPOSE & SCOPE**

This is a **comprehensive hospital management system** specifically designed for **RSUD Anugerah Tomohon** with the following core objectives:

### **Primary Functions:**
1. **Staff Management** - Employee registration, roles, and profiles
2. **Shift Scheduling** - Complex hospital shift management
3. **Attendance Tracking** - Clock in/out with photo verification
4. **Shift Swapping** - Request and approval workflow
5. **Real-time Notifications** - Telegram bot integration
6. **Event Management** - Hospital activities and announcements

### **Target Users:**
- **Hospital Administrators** - Full system control
- **Supervisors** - Department management
- **Medical Staff** (Doctors, Nurses) - Shift and attendance management
- **Support Staff** - Basic attendance and scheduling

---

## 📁 **CODEBASE STRUCTURE ANALYSIS**

### **Root Directory:**
```
/Thesis/
├── 📄 Documentation Files (*.md)
├── 🔧 Configuration Scripts (*.sh)
├── 🐳 Docker Configuration
├── 📱 backend/ (NestJS API)
├── 🌐 frontend/ (Next.js Web App)
└── 📦 frontend_backup/ (Backup copy)
```

---

## 🔧 **BACKEND (NestJS) DETAILED BREAKDOWN**

### **Core Architecture: `/backend/src/`**

#### **1. Application Entry Point:**
- **`main.ts`** - Application bootstrap, CORS setup, port 3001
- **`app.module.ts`** - Root module, imports all feature modules
- **`app.controller.ts`** - Basic health check endpoint

#### **2. Authentication System: `/auth/`**
```typescript
AuthModule
├── auth.service.ts     # JWT token generation, password validation
├── auth.controller.ts  # Login endpoint
├── auth.module.ts      # JWT configuration
├── jwt-auth.guard.ts   # Route protection
└── dto/login.dto.ts    # Login validation
```

**Key Features:**
- **JWT Authentication** with 7-day expiration
- **bcrypt Password Hashing**
- **Role-based Authorization** (ADMIN, SUPERVISOR, DOKTER, PERAWAT, STAF)

#### **3. User Management: `/user/`**
```typescript
UserModule
├── user.service.ts           # CRUD operations, statistics
├── user.controller.ts        # REST endpoints
├── user-telegram.controller.ts # Telegram integration
├── user.module.ts           # Module configuration
└── dto/                     # Data validation
    ├── create-user.dto.ts
    └── update-user.dto.ts
```

**Capabilities:**
- **User Registration** with validation
- **Profile Management** 
- **Gender/Role Statistics** for dashboard
- **Telegram Chat ID** management

#### **4. Shift Management: `/shift/`**
```typescript
ShiftModule
├── shift.service.ts              # Complex shift logic
├── shift.controller.ts           # Shift CRUD endpoints
├── shift-swap-request.service.ts # Shift swapping workflow
├── shift-swap-request.controller.ts
├── shift-type.config.ts          # RSUD Anugerah shift definitions
└── dto/                          # Validation schemas
```

**Shift Types (Based on RSUD Anugerah):**
- **GEDUNG_ADMINISTRASI** (07:00-14:00)
- **RAWAT_JALAN** (07:00-14:00) 
- **RAWAT_INAP_3_SHIFT** (Pagi/Siang/Malam)
- **GAWAT_DARURAT_3_SHIFT** (24/7 coverage)
- **LABORATORIUM_2_SHIFT** (Pagi/Siang)
- **FARMASI_2_SHIFT** (Pagi/Siang)

#### **5. Attendance System: `/absensi/`**
```typescript
AbsensiModule
├── absensi.service.ts     # Clock in/out logic
├── absensi.controller.ts  # Attendance endpoints
├── dto/
└── # Photo upload support for verification
```

**Features:**
- **Clock In/Out** with timestamp
- **Photo Verification** (optional)
- **Location Tracking** for on-site verification
- **Late Attendance** tracking
- **Monthly Reports** generation

#### **6. Notification System: `/notifikasi/`**
```typescript
NotifikasiModule
├── telegram-bot.service.ts           # Core Telegram API
├── notification-integration.service.ts # Hospital workflow integration
├── notifikasi.service.ts             # Database notifications
├── notifikasi.controller.ts          # REST API
├── notification.gateway.ts           # WebSocket real-time
└── telegram.controller.ts            # Telegram webhooks
```

**Telegram Bot Capabilities:**
- **Commands:** `/start`, `/help`, `/myid`, `/status`
- **Long Polling** for development
- **Webhook Support** for production
- **Message Templates** for hospital notifications
- **Error Handling** and retry logic

#### **7. Event Management: `/kegiatan/`**
```typescript
KegiatanModule
├── kegiatan.service.ts     # Event CRUD
├── kegiatan.controller.ts  # REST endpoints
└── dto/                    # Event validation
```

#### **8. Database Layer: `/prisma/`**
```typescript
PrismaModule
├── prisma.service.ts  # Database connection
├── prisma.module.ts   # Service configuration
└── schema.prisma      # Database schema
```

---

## 🌐 **FRONTEND (Next.js) DETAILED BREAKDOWN**

### **Core Architecture: `/frontend/src/`**

#### **1. Application Structure:**
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page (auth redirect)
│   ├── globals.css        # Global styles
│   ├── admin/             # Administrator interface
│   ├── pegawai/           # Employee interface  
│   ├── sign-in/           # Authentication
│   └── dashboard/         # General dashboard
├── components/            # Reusable components
├── lib/                   # Utilities and API clients
└── styles/                # Additional styling
```

#### **2. Authentication Flow:**
```typescript
// pages flow:
Home (/) 
  ↓ (check localStorage)
  ├── Admin Dashboard (/admin) - for ADMIN/SUPERVISOR
  ├── Employee Dashboard (/pegawai) - for PERAWAT/DOKTER/STAF  
  └── Sign In (/sign-in) - if not authenticated
```

#### **3. User Interfaces by Role:**

**Admin Interface (`/admin/`):**
- **User Management** - Create, edit, delete staff
- **Shift Management** - Assign and manage schedules
- **Attendance Monitoring** - View all attendance records
- **Event Management** - Create hospital activities
- **Statistics Dashboard** - Comprehensive reports
- **Notification Center** - Send announcements

**Employee Interface (`/pegawai/`):**
- **Personal Dashboard** - Quick status overview
- **Attendance** - Clock in/out functionality
- **My Shifts** - View assigned schedules
- **Shift Swap Requests** - Request schedule changes
- **Profile Management** - Update personal info
- **Notifications** - View personal messages

#### **4. Key Components:**

**Reusable Components (`/components/`):**
- **Navigation** - Role-based menu systems
- **Forms** - Consistent form styling and validation
- **Tables** - Data display with sorting/filtering
- **Modals** - Popup dialogs and confirmations
- **Notifications** - Real-time WebSocket integration
- **Charts** - Dashboard visualizations

---

## 🗃️ **DATABASE SCHEMA (Prisma)**

### **Core Tables:**

#### **1. Users Table:**
```sql
users {
  id: Primary Key
  username: Unique identifier
  email: Unique email
  password: Hashed with bcrypt
  namaDepan: First name
  namaBelakang: Last name
  role: ENUM (ADMIN, SUPERVISOR, DOKTER, PERAWAT, STAF)
  telegramChatId: For notifications
  status: ACTIVE/INACTIVE
  createdAt, updatedAt: Timestamps
}
```

#### **2. Shifts Table:**
```sql
shifts {
  id: Primary Key
  userId: Foreign Key to users
  tanggal: Shift date
  jammulai: Start time (HH:MM)
  jamselesai: End time (HH:MM) 
  lokasishift: Location (LokasiShift ENUM)
  tipeshift: Type description
  shiftType: ShiftType ENUM
  createdAt, updatedAt: Timestamps
}
```

#### **3. Attendance Table:**
```sql
absensis {
  id: Primary Key
  userId: Foreign Key to users
  shiftId: Foreign Key to shifts (unique)
  jamMasuk: Clock in timestamp
  jamKeluar: Clock out timestamp
  status: ENUM (HADIR, TERLAMBAT, IZIN, ALFA)
  foto: Photo path for verification
  lokasi: GPS/location data
  catatan: Additional notes
}
```

#### **4. Shift Swap Table:**
```sql
shiftswaps {
  id: Primary Key
  fromUserId: Requester
  toUserId: Target user
  shiftId: Shift to be swapped
  status: ENUM (PENDING, APPROVED, REJECTED)
  alasan: Reason for swap
  requiresUnitHead: Boolean for approval chain
  [multiple approval timestamps and IDs]
}
```

#### **5. Notifications Table:**
```sql
notifikasi {
  id: Primary Key
  userId: Recipient
  judul: Notification title
  pesan: Message content
  jenis: NotificationType ENUM
  status: READ/UNREAD
  sentVia: WEB/TELEGRAM/BOTH
  telegramSent: Boolean status
  data: JSON additional data
}
```

---

## 🤖 **TELEGRAM BOT INTEGRATION**

### **Bot Architecture:**
```typescript
TelegramBotService {
  // Core API wrapper
  + sendMessage(chatId, text, options)
  + getMe() // Bot information
  + setMyCommands() // Command setup
  + getUpdates() // Long polling
  
  // Hospital-specific features  
  + sendShiftReminder(userId, shiftData)
  + sendSwapApproval(userId, swapData)
  + sendSystemAlert(userId, message)
}
```

### **Commands Available:**
- **`/start`** - Welcome message + Chat ID
- **`/help`** - Complete feature guide
- **`/myid`** - Get Telegram Chat ID
- **`/status`** - Bot and notification status

### **Notification Types:**
1. **REMINDER_SHIFT** - Upcoming shift alerts
2. **KONFIRMASI_TUKAR_SHIFT** - Swap approvals/rejections  
3. **PERSETUJUAN_CUTI** - Leave request status
4. **KEGIATAN_HARIAN** - Daily activities
5. **ABSENSI_TERLAMBAT** - Late attendance warnings
6. **SISTEM_INFO** - System announcements

---

## 🔄 **WORKFLOW EXAMPLES**

### **1. Employee Attendance Flow:**
```
Employee opens app → Login → Dashboard → Click "Clock In" 
→ Take photo (optional) → Confirm location → Record attendance
→ Notification sent to supervisor → WebSocket update to admin dashboard
```

### **2. Shift Swap Request Flow:**
```
Employee requests swap → Select target colleague → Provide reason
→ System validates → Notifications sent → Approval chain workflow
→ Final approval → Schedules updated → All parties notified
```

### **3. Telegram Notification Flow:**
```
Hospital event occurs → Backend triggered → Check user preferences
→ Create notification record → Send via Telegram API
→ Update delivery status → Real-time WebSocket to web app
```

---

## ⚙️ **DEVELOPMENT & DEPLOYMENT**

### **Environment Configuration:**
```bash
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="secure-key"
TELEGRAM_BOT_TOKEN="bot-token"

# Frontend (environment variables)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### **Development Commands:**
```bash
# Start complete system
./start-thesis-system.sh

# Individual services
cd backend && npm run start:dev    # NestJS with hot reload
cd frontend && npm run dev:stable  # Next.js stable mode

# Database operations
npx prisma migrate dev      # Apply migrations
npx prisma studio          # Database GUI
npx prisma db seed          # Seed sample data
```

### **Production Deployment:**
```bash
# Docker deployment
docker-compose up -d        # All services
docker-compose --profile=prod up  # Production mode

# Manual build
npm run build              # Both frontend and backend
npm run start:prod         # Production servers
```

---

## 🎯 **KEY FEATURES IMPLEMENTED**

### ✅ **Completed Features:**
1. **Multi-role Authentication** - Complete JWT system
2. **Comprehensive Shift Management** - RSUD Anugerah specific
3. **Real-time Attendance** - Photo and location verification
4. **Telegram Bot Integration** - Production-ready
5. **WebSocket Notifications** - Real-time updates
6. **Responsive Design** - Mobile-friendly interface
7. **Database Relationships** - Complex hospital workflows
8. **Error Handling** - Comprehensive error management
9. **Performance Optimization** - Fast loading times
10. **Security Implementation** - Input validation, SQL injection prevention

### 🔧 **Technical Highlights:**
- **TypeScript** throughout for type safety
- **Prisma ORM** for database management
- **JWT Authentication** with role-based access
- **Real-time WebSocket** for instant updates
- **Telegram Bot API** integration
- **Next.js App Router** for modern routing
- **Tailwind CSS** for responsive design
- **Docker containerization** for deployment

---

## 📈 **SYSTEM METRICS & PERFORMANCE**

### **Database Performance:**
- **PostgreSQL** with optimized queries
- **Prisma** with connection pooling
- **Indexed fields** for fast lookups
- **11 migrations** successfully applied

### **API Performance:**
- **RESTful endpoints** with proper HTTP methods
- **Input validation** using DTO classes
- **Error handling** with descriptive messages
- **JWT middleware** for security

### **Frontend Performance:**
- **Next.js optimizations** enabled
- **Lazy loading** for components
- **Image optimization** for faster loading
- **Font preloading** for better UX

---

## 🎓 **THESIS CONTEXT**

This system demonstrates:
- **Full-stack development** capabilities
- **Real-world problem solving** for hospital management
- **Modern web technologies** implementation
- **Integration with external APIs** (Telegram)
- **Database design** for complex relationships
- **User experience** considerations
- **Security best practices**
- **Scalable architecture** design

The codebase serves as a complete example of a modern hospital management system with innovative notification features through Telegram integration.

---

**Generated:** July 3, 2025  
**Status:** Production Ready ✅

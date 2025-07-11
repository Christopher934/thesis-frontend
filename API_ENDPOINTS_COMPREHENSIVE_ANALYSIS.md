# API Endpoints Analysis - Hospital Management System

## Backend API Endpoints

### 1. Authentication Endpoints

**Controller**: `AuthController` (`/auth`)

- `POST /auth/login` - User login authentication

### 2. User Management Endpoints

**Controller**: `UserController` (`/users`)

- `GET /users` - Get all users
- `GET /users/count-by-gender` - Get user count by gender
- `GET /users/count-by-role` - Get user count by role
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user by ID
- `DELETE /users/:id` - Delete user by ID

### 3. Shift Management Endpoints

**Controller**: `ShiftController` (`/shifts`)

- `GET /shifts` - Get all shifts
- `GET /shifts/types` - Get available shift types
- `GET /shifts/types/:shiftType` - Get shift schedules for specific type
- `GET /shifts/types/:shiftType/options` - Get shift options for date and type
- `GET /shifts/installation/:installasi` - Get shifts by installation type
- `GET /shifts/:id` - Get shift by ID
- `POST /shifts` - Create new shift
- `POST /shifts/with-type` - Create shift with RSUD shift type system
- `POST /shifts/validate` - Validate shift time for given type and date
- `PATCH /shifts/:id` - Update shift by ID
- `DELETE /shifts/:id` - Delete shift by ID

### 4. Shift Swap Request Endpoints

**Controller**: `ShiftSwapRequestController` (`/shift-swap-requests`)

- `GET /shift-swap-requests` - Get all swap requests (with filters)
- `GET /shift-swap-requests/my-requests` - Get user's own swap requests
- `GET /shift-swap-requests/pending-approvals` - Get pending approvals for user
- `GET /shift-swap-requests/:id` - Get swap request by ID
- `POST /shift-swap-requests` - Create new swap request
- `PATCH /shift-swap-requests/:id` - Update swap request
- `PATCH /shift-swap-requests/:id/respond` - Respond to swap request
- `DELETE /shift-swap-requests/:id` - Delete swap request

### 5. Employee (Pegawai) Endpoints

**Controller**: `PegawaiController` (`/pegawai`)

- `DELETE /pegawai/:id` - Delete employee by ID

### 6. Events/Activities Endpoints

**Controller**: `KegiatanController` (`/events`)

- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create new event
- `PUT /events/:id` - Update event by ID
- `DELETE /events/:id` - Delete event by ID

### 7. Attendance (Absensi) Endpoints

**Controller**: `AbsensiController` (`/absensi`)

- `GET /absensi/my-attendance` - Get user's attendance records
- `GET /absensi/today/:userId` - Get today's attendance for specific user
- `GET /absensi/today` - Get today's attendance for logged-in user
- `GET /absensi/dashboard-stats` - Get dashboard statistics
- `GET /absensi/all` - Get all attendance records (admin only)
- `GET /absensi/reports/monthly` - Get monthly attendance report
- `GET /absensi/reports/stats` - Get attendance statistics
- `POST /absensi/masuk` - Record attendance in
- `PATCH /absensi/keluar/:id` - Record attendance out
- `PATCH /absensi/verify/:id` - Verify attendance (admin only)

### 8. Notification Endpoints

**Controller**: `NotifikasiController` (`/notifikasi`)

- `GET /notifikasi` - Get user's notifications with role-based filtering
- `GET /notifikasi/unread-count` - Get count of unread notifications
- `GET /notifikasi/admin/all` - Get all notifications (admin view)
- `POST /notifikasi` - Create new notification
- `POST /notifikasi/test/shift-reminder` - Test shift reminder notification
- `POST /notifikasi/test/new-shift` - Test new shift notification
- `PUT /notifikasi/:id/read` - Mark notification as read
- `PUT /notifikasi/mark-read` - Mark multiple notifications as read
- `DELETE /notifikasi/:id` - Delete notification

### 9. Telegram Integration Endpoints

**Controller**: `TelegramController` (`/telegram`)

- `GET /telegram/bot-info` - Get bot information
- `POST /telegram/webhook` - Handle Telegram webhook updates
- `POST /telegram/setup-commands` - Setup bot commands
- `POST /telegram/set-webhook` - Set webhook URL for production

**Controller**: `UserTelegramController` (`/user`)

- `PUT /user/telegram-chat-id` - Update user's Telegram chat ID
- `POST /user/test-telegram` - Test Telegram notification for user

### 10. User Notification Endpoints

**Controller**: `UserNotificationsController` (`/api/user-notifications`)

- `POST /api/user-notifications/personal-attendance-reminder` - Send personal attendance reminder (admin/supervisor only)
- `POST /api/user-notifications/personal-task-assignment` - Send personal task assignment (admin/supervisor only)
- `POST /api/user-notifications/personal-evaluation-results` - Send personal evaluation results (admin/supervisor only)
- `POST /api/user-notifications/personal-shift-swap` - Send personal shift swap confirmation (admin/supervisor only)
- `POST /api/user-notifications/personal-schedule-change` - Send personal schedule change notification (admin/supervisor only)
- `POST /api/user-notifications/personal-leave-status` - Send personal leave status update (admin/supervisor only)
- `POST /api/user-notifications/personal-announcement` - Send personal announcement (admin/supervisor only)
- `POST /api/user-notifications/personal-emergency-alert` - Send personal emergency alert (admin/supervisor only)
- `GET /api/user-notifications/user-preferences` - Get user notification preferences
- `PUT /api/user-notifications/user-preferences` - Update user notification preferences
- `GET /api/user-notifications/delivery-status/:notificationId` - Get notification delivery status
- `POST /api/user-notifications/test-delivery` - Test notification delivery

## Frontend API Usage

### 1. Authentication

- `POST /auth/login` - Sign in page login

### 2. User Management

- `GET /users` - Dashboard user data loading
- `POST /users` - Create new user (pegawai forms)
- `PUT /users/:id` - Update user (pegawai forms)
- `DELETE /users/:id` - Delete user (via FormModal)

### 3. Shift Management

- `GET /shifts` - Dashboard shift loading, today's schedule
- `POST /shifts` - Create new shift (jadwal forms)
- `PUT /shifts/:id` - Update shift (jadwal forms)
- `DELETE /shifts/:id` - Delete shift (via FormModal)

### 4. Events Management

- `GET /events` - Event calendar, events page
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### 5. Notifications

- `GET /notifikasi` - Notification center, notification list
- `PUT /notifikasi/:id/read` - Mark single notification as read
- `PUT /notifikasi/mark-read` - Mark multiple notifications as read
- `DELETE /notifikasi/:id` - Delete notification

### 6. Attendance

- `GET /absensi/dashboard-stats` - Dashboard attendance statistics
- `POST /absensi/masuk` - Clock in (attendance page)

### 7. Telegram Integration

- `PUT /user/telegram-chat-id` - Update telegram chat ID
- `POST /user/test-telegram` - Test telegram notification
- `POST /telegram/webhook` - Handle Telegram webhook updates
- `POST /telegram/setup-commands` - Setup bot commands
- `GET /telegram/bot-info` - Get bot information
- `POST /telegram/set-webhook` - Set webhook URL

## Summary by HTTP Method

### GET Endpoints (24 endpoints)

| Endpoint                                                  | Controller        | Description                               |
| --------------------------------------------------------- | ----------------- | ----------------------------------------- |
| `/`                                                       | App               | Get hello message                         |
| `/users`                                                  | User              | Get all users                             |
| `/users/count-by-gender`                                  | User              | Get user count by gender                  |
| `/users/count-by-role`                                    | User              | Get user count by role                    |
| `/users/:id`                                              | User              | Get user by ID                            |
| `/shifts`                                                 | Shift             | Get all shifts                            |
| `/shifts/types`                                           | Shift             | Get available shift types                 |
| `/shifts/types/:shiftType`                                | Shift             | Get shift schedules for specific type     |
| `/shifts/types/:shiftType/options`                        | Shift             | Get shift options for date and type       |
| `/shifts/installation/:installasi`                        | Shift             | Get shifts by installation type           |
| `/shifts/:id`                                             | Shift             | Get shift by ID                           |
| `/shift-swap-requests`                                    | ShiftSwapRequest  | Get all swap requests                     |
| `/shift-swap-requests/my-requests`                        | ShiftSwapRequest  | Get user's own swap requests              |
| `/shift-swap-requests/pending-approvals`                  | ShiftSwapRequest  | Get pending approvals                     |
| `/shift-swap-requests/:id`                                | ShiftSwapRequest  | Get swap request by ID                    |
| `/events`                                                 | Kegiatan          | Get all events                            |
| `/events/:id`                                             | Kegiatan          | Get event by ID                           |
| `/absensi/my-attendance`                                  | Absensi           | Get user's attendance records             |
| `/absensi/today/:userId`                                  | Absensi           | Get today's attendance for specific user  |
| `/absensi/today`                                          | Absensi           | Get today's attendance for logged-in user |
| `/absensi/dashboard-stats`                                | Absensi           | Get dashboard statistics                  |
| `/absensi/all`                                            | Absensi           | Get all attendance records (admin only)   |
| `/absensi/reports/monthly`                                | Absensi           | Get monthly attendance report             |
| `/absensi/reports/stats`                                  | Absensi           | Get attendance statistics                 |
| `/notifikasi`                                             | Notifikasi        | Get user's notifications                  |
| `/notifikasi/unread-count`                                | Notifikasi        | Get count of unread notifications         |
| `/notifikasi/admin/all`                                   | Notifikasi        | Get all notifications (admin)             |
| `/telegram/bot-info`                                      | Telegram          | Get bot information                       |
| `/api/user-notifications/user-preferences`                | UserNotifications | Get user notification preferences         |
| `/api/user-notifications/delivery-status/:notificationId` | UserNotifications | Get notification delivery status          |

### POST Endpoints (17 endpoints)

| Endpoint                                | Controller        | Description                                           |
| --------------------------------------- | ----------------- | ----------------------------------------------------- |
| `/auth/login`                           | Auth              | User login authentication                             |
| `/users`                                | User              | Create new user                                       |
| `/shifts`                               | Shift             | Create new shift                                      |
| `/shifts/with-type`                     | Shift             | Create shift with RSUD shift type system              |
| `/shifts/validate`                      | Shift             | Validate shift time                                   |
| `/shift-swap-requests`                  | ShiftSwapRequest  | Create new swap request                               |
| `/events`                               | Kegiatan          | Create new event                                      |
| `/absensi/masuk`                        | Absensi           | Record attendance in                                  |
| `/notifikasi`                           | Notifikasi        | Create new notification                               |
| `/notifikasi/test/shift-reminder`       | Notifikasi        | Test shift reminder notification                      |
| `/notifikasi/test/new-shift`            | Notifikasi        | Test new shift notification                           |
| `/telegram/webhook`                     | Telegram          | Handle Telegram webhook updates                       |
| `/telegram/setup-commands`              | Telegram          | Setup bot commands                                    |
| `/telegram/set-webhook`                 | Telegram          | Set webhook URL                                       |
| `/user/test-telegram`                   | UserTelegram      | Test Telegram notification                            |
| `/api/user-notifications/personal-*`    | UserNotifications | Various personal notification endpoints (8 endpoints) |
| `/api/user-notifications/test-delivery` | UserNotifications | Test notification delivery                            |

### PUT Endpoints (7 endpoints)

| Endpoint                                   | Controller        | Description                          |
| ------------------------------------------ | ----------------- | ------------------------------------ |
| `/users/:id`                               | User              | Update user by ID                    |
| `/events/:id`                              | Kegiatan          | Update event by ID                   |
| `/notifikasi/:id/read`                     | Notifikasi        | Mark notification as read            |
| `/notifikasi/mark-read`                    | Notifikasi        | Mark multiple notifications as read  |
| `/user/telegram-chat-id`                   | UserTelegram      | Update user's Telegram chat ID       |
| `/api/user-notifications/user-preferences` | UserNotifications | Update user notification preferences |

### PATCH Endpoints (4 endpoints)

| Endpoint                           | Controller       | Description                    |
| ---------------------------------- | ---------------- | ------------------------------ |
| `/shifts/:id`                      | Shift            | Update shift by ID             |
| `/shift-swap-requests/:id`         | ShiftSwapRequest | Update swap request            |
| `/shift-swap-requests/:id/respond` | ShiftSwapRequest | Respond to swap request        |
| `/absensi/keluar/:id`              | Absensi          | Record attendance out          |
| `/absensi/verify/:id`              | Absensi          | Verify attendance (admin only) |

### DELETE Endpoints (6 endpoints)

| Endpoint                   | Controller       | Description           |
| -------------------------- | ---------------- | --------------------- |
| `/users/:id`               | User             | Delete user by ID     |
| `/shifts/:id`              | Shift            | Delete shift by ID    |
| `/shift-swap-requests/:id` | ShiftSwapRequest | Delete swap request   |
| `/pegawai/:id`             | Pegawai          | Delete employee by ID |
| `/events/:id`              | Kegiatan         | Delete event by ID    |
| `/notifikasi/:id`          | Notifikasi       | Delete notification   |

**Total Endpoints: 58**

## Security Implementation

### Authentication Guards

- `JwtAuthGuard` - Applied to most endpoints requiring authentication
- Role-based access control for admin endpoints

### Protected Endpoints

Most endpoints require JWT authentication except:

- `POST /auth/login` - Login endpoint
- Basic GET endpoints for public data

## API Base URL Configuration

- Development: `http://localhost:3001`
- Production: Configured via `NEXT_PUBLIC_API_URL` environment variable

## Error Handling

- Standardized error responses
- Fallback mechanisms for API failures
- Mock implementations for development

## Data Transfer Objects (DTOs)

- Input validation using class-validator
- Whitelist validation to prevent unwanted properties
- Specific DTOs for different operations (Create, Update, Response)

## Database Integration

- Prisma ORM for database operations
- PostgreSQL database
- Proper foreign key relationships
- Soft deletes where applicable

## Notes

1. Some endpoints have role-based restrictions (admin/supervisor only)
2. Mock implementations exist for development/testing
3. Telegram integration is implemented but may need verification
4. Error handling includes both API and fallback mechanisms
5. Authentication is JWT-based with user context injection
6. **✅ POST endpoints fixed** - DateTime format and enum validation issues resolved

## Fixed Issues (July 11, 2025)

1. **✅ DateTime Format Issues**: Fixed time string to DateTime conversion in shifts and events
2. **✅ Enum Validation**: Corrected notification enum values to match Prisma schema
3. **✅ DTO Validation**: Resolved user creation validation issues
4. **✅ Error Handling**: Improved error messages and validation responses

## Missing/Incomplete Endpoints

1. Complete user profile management
2. Advanced reporting endpoints
3. Bulk operations for shifts/users
4. File upload endpoints
5. Audit trail endpoints

## Recommendations

1. Implement comprehensive API documentation (OpenAPI/Swagger)
2. Add rate limiting for security
3. Implement proper logging and monitoring
4. Add API versioning strategy
5. Implement comprehensive error handling standards
6. Add data validation and sanitization
7. Implement proper CORS configuration
8. Add API health check endpoints

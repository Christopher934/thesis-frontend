# RSUD Anugerah - Main API Endpoints

## 🔑 Authentication

| Endpoint      | Method | Description                     | Access |
| ------------- | ------ | ------------------------------- | ------ |
| `/auth/login` | POST   | Login dengan email dan password | Public |

## 👥 User Management (Utama)

| Endpoint     | Method | Description                    | Access |
| ------------ | ------ | ------------------------------ | ------ |
| `/users`     | GET    | Daftar semua pengguna          | Admin  |
| `/users/:id` | GET    | Detail pengguna berdasarkan ID | Auth   |
| `/users`     | POST   | Buat pengguna baru             | Admin  |
| `/users/:id` | PUT    | Update data pengguna           | Admin  |

## ⏰ Absensi (Core)

| Endpoint                   | Method | Description             | Access |
| -------------------------- | ------ | ----------------------- | ------ |
| `/absensi/masuk`           | POST   | Absen masuk             | Auth   |
| `/absensi/keluar/:id`      | PATCH  | Absen keluar            | Auth   |
| `/absensi/today`           | GET    | Absensi hari ini        | Auth   |
| `/absensi/my-attendance`   | GET    | Riwayat absensi pribadi | Auth   |
| `/absensi/dashboard-stats` | GET    | Statistik dashboard     | Admin  |

## 📅 Shift Management (Core)

| Endpoint        | Method | Description                | Access |
| --------------- | ------ | -------------------------- | ------ |
| `/shifts`       | GET    | Daftar semua shift         | Auth   |
| `/shifts`       | POST   | Buat shift baru            | Admin  |
| `/shifts/types` | GET    | Jenis-jenis shift tersedia | Auth   |
| `/shifts/:id`   | PATCH  | Update shift               | Admin  |

## 🔄 Tukar Shift

| Endpoint                           | Method | Description                     | Access |
| ---------------------------------- | ------ | ------------------------------- | ------ |
| `/shift-swap-requests`             | GET    | Daftar permintaan tukar shift   | Auth   |
| `/shift-swap-requests`             | POST   | Buat permintaan tukar shift     | Auth   |
| `/shift-swap-requests/my-requests` | GET    | Permintaan tukar shift saya     | Auth   |
| `/shift-swap-requests/:id/respond` | PATCH  | Tanggapi permintaan tukar shift | Auth   |

## 📢 Notifikasi (Core)

| Endpoint                   | Method | Description                    | Access |
| -------------------------- | ------ | ------------------------------ | ------ |
| `/notifikasi`              | GET    | Daftar notifikasi              | Auth   |
| `/notifikasi/unread-count` | GET    | Jumlah notifikasi belum dibaca | Auth   |
| `/notifikasi/:id/read`     | PUT    | Tandai notifikasi sudah dibaca | Auth   |

## 📋 Event/Kegiatan

| Endpoint      | Method | Description        | Access |
| ------------- | ------ | ------------------ | ------ |
| `/events`     | GET    | Daftar semua event | Auth   |
| `/events`     | POST   | Buat event baru    | Admin  |
| `/events/:id` | PUT    | Update event       | Admin  |

## 💬 Telegram Integration

| Endpoint                 | Method | Description             | Access |
| ------------------------ | ------ | ----------------------- | ------ |
| `/telegram/bot-info`     | GET    | Info bot Telegram       | Public |
| `/user/telegram-chat-id` | PUT    | Update Chat ID Telegram | Auth   |

---

## 🔐 Level Akses

- **Public**: Tidak perlu login (endpoint terbuka)
- **Auth**: Perlu login dengan JWT token (semua user yang sudah login)
- **Admin**: Khusus admin atau supervisor (role admin/supervisor)

## 📊 Ringkasan

- **Total Endpoint Utama**: 24 dari 72 endpoint
- **Kategori**: 8 kategori utama
- **Public Access**: 2 endpoints (Login, Bot Info)
- **Auth Required**: 16 endpoints (User biasa)
- **Admin Only**: 6 endpoints (Admin/Supervisor)

## 🔑 Access Distribution

- **Public**: `/auth/login`, `/telegram/bot-info`
- **Auth**: Absensi, notifikasi, tukar shift, telegram integration
- **Admin**: User management, shift management, event management, dashboard stats

---

_Dibuat pada: 5 Juli 2025_  
_RSUD Anugerah Hospital Management System_  
_Endpoint Utama untuk Penggunaan Sehari-hari dengan Level Akses_

# PANDUAN LENGKAP SETUP TELEGRAM BOT RSUD ANUGERAH 🤖

## STATUS SAAT INI

✅ **Backend Service**: Sudah lengkap dan siap digunakan  
✅ **Database Schema**: Sudah ada field `telegramChatId` di tabel User  
✅ **API Endpoints**: Sudah tersedia untuk integrasi Telegram  
🔄 **Yang Perlu Dilakukan**: Membuat bot di Telegram dan konfigurasi

---

## LANGKAH 1: MEMBUAT BOT TELEGRAM 🔧

### 1.1 Buka Telegram dan Cari BotFather

1. Buka aplikasi Telegram di HP atau web (https://web.telegram.org)
2. Cari **@BotFather** (official bot untuk membuat bot)
3. Klik **Start** atau ketik `/start`

### 1.2 Buat Bot Baru

Ketik command berikut satu per satu:

```
/newbot
```

BotFather akan bertanya nama bot:

```
RSUD Anugerah Notification Bot
```

Kemudian username bot (harus diakhiri dengan 'bot'):

```
rsud_anugerah_notif_bot
```

### 1.3 Simpan Token Bot

BotFather akan memberikan token seperti ini:

```
123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

**⚠️ PENTING: Simpan token ini dengan aman!**

---

## LANGKAH 2: KONFIGURASI BACKEND 🛠️

### 2.1 Tambahkan Token ke Environment Variables

```bash
# Buka file .env di folder backend
nano /Users/jo/Documents/Backup_2/Thesis/backend/.env
```

Tambahkan baris berikut:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
```

### 2.2 Restart Backend Server

```bash
cd /Users/jo/Documents/Backup_2/Thesis/backend

# Kill existing server
pkill -f "npm.*start"

# Start server again
npm run start:dev
```

---

## LANGKAH 3: TESTING BOT 🧪

### 3.1 Test Bot Info

```bash
# Ganti YOUR_BOT_TOKEN dengan token sebenarnya
curl -X GET "https://api.telegram.org/bot123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw/getMe"
```

Response yang diharapkan:

```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "RSUD Anugerah Notification Bot",
    "username": "rsud_anugerah_notif_bot"
  }
}
```

### 3.2 Test Send Message

```bash
# Ganti CHAT_ID dengan ID chat Anda
curl -X POST "https://api.telegram.org/bot123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "text": "🏥 Halo! Bot RSUD Anugerah sudah siap! ✅"
  }'
```

---

## LANGKAH 4: MENDAPATKAN CHAT ID USER 👤

### 4.1 Cara Manual (Untuk Testing)

1. Cari bot Anda di Telegram: `@rsud_anugerah_notif_bot`
2. Klik **Start** atau ketik `/start`
3. Ketik `/myid` untuk mendapatkan Chat ID
4. Bot akan membalas dengan Chat ID Anda

### 4.2 Cara Otomatis (Untuk User)

1. User mencari bot di Telegram
2. User mengirim `/start` ke bot
3. Bot memberikan instruksi untuk menyimpan Chat ID
4. User masuk ke profile mereka di web app
5. User memasukkan Chat ID ke field yang tersedia

---

## LANGKAH 5: INTEGRASI DENGAN FRONTEND 🌐

### 5.1 Tambahkan Field Chat ID ke User Profile

Buat komponen form untuk user memasukkan Telegram Chat ID mereka.

### 5.2 API Endpoint untuk Update Chat ID

Backend sudah siap menerima update Chat ID melalui API.

---

## LANGKAH 6: TESTING NOTIFIKASI END-TO-END 🔔

### 6.1 Test Manual via API

```bash
# Login untuk mendapatkan token
curl -X POST "http://localhost:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Buat notifikasi test
curl -X POST "http://localhost:3001/notifikasi" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "judul": "Test Telegram Notification",
    "pesan": "Bot Telegram RSUD Anugerah berhasil terhubung! 🎉",
    "jenis": "SISTEM_INFO"
  }'
```

### 6.2 Test dari Frontend

1. Login ke aplikasi web
2. Buat notifikasi baru dari dashboard
3. Periksa apakah notifikasi terkirim ke Telegram

---

## CONTOH COMMAND BOT YANG TERSEDIA 📱

Bot sudah dikonfigurasi dengan commands berikut:

- `/start` - Mulai menggunakan bot
- `/help` - Bantuan penggunaan
- `/myid` - Dapatkan Chat ID Telegram
- `/notifications` - Status notifikasi

---

## TROUBLESHOOTING 🔧

### Bot Tidak Merespons

1. **Cek token**: Pastikan token di .env benar
2. **Restart server**: Restart backend setelah menambah token
3. **Cek logs**: Lihat log backend untuk error

### Notifikasi Tidak Terkirim

1. **Cek Chat ID**: Pastikan user sudah set Chat ID
2. **Cek koneksi**: Tes koneksi API Telegram
3. **Cek logs**: Periksa log untuk error Telegram

### Error "Bot token not configured"

```bash
# Pastikan .env berisi:
TELEGRAM_BOT_TOKEN="your_actual_token_here"

# Restart server
npm run start:dev
```

---

## KEAMANAN 🔒

✅ **Token disimpan di environment variables**  
✅ **Tidak ada hardcoding credentials**  
✅ **Rate limiting untuk prevent spam**  
✅ **Error handling yang robust**  
✅ **Validasi input user**

---

## LANGKAH SELANJUTNYA 🚀

Setelah bot setup:

1. **Enable WebSocket** untuk real-time notifications
2. **Enable CRON jobs** untuk shift reminders otomatis
3. **Tambah fitur webhook** untuk production
4. **Monitoring dan logging** untuk bot performance

---

## QUICK START SCRIPT 🚀

Saya akan membuat script otomatis untuk testing bot:

```bash
# File: test-telegram-bot.sh
#!/bin/bash

echo "🤖 Testing Telegram Bot Setup..."

# Check if token is configured
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN not configured"
    echo "Please add your bot token to backend/.env"
    exit 1
fi

# Test bot info
echo "📡 Testing bot connection..."
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" | jq .

echo "✅ Bot setup test completed!"
```

**Apakah Anda siap untuk memulai setup bot Telegram? Saya bisa membantu membuat script testing dan konfigurasi yang diperlukan.**

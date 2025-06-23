# TELEGRAM BOT SETUP GUIDE

## Langkah 1: Membuat Bot Telegram

1. **Buka Telegram dan cari @BotFather**
2. **Mulai chat dengan /start**
3. **Buat bot baru dengan command:**
   ```
   /newbot
   ```
4. **Berikan nama untuk bot Anda:**
   ```
   RSUD Anugerah Notification Bot
   ```
5. **Berikan username untuk bot (harus diakhiri dengan 'bot'):**
   ```
   rsud_anugerah_bot
   ```
6. **Simpan token yang diberikan BotFather**

## Langkah 2: Konfigurasi Backend

1. **Tambahkan token ke file .env backend:**

   ```bash
   # Backend .env
   TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
   ```

2. **Restart backend server:**
   ```bash
   cd backend
   npm run start:dev
   ```

## Langkah 3: Mendapatkan Chat ID User

### Metode 1: Manual Command

1. User mengirim pesan ke bot: `/start`
2. Bot akan merespons dengan Chat ID mereka
3. User menyimpan Chat ID di profile mereka

### Metode 2: Otomatis via Webhook (Rekomendasi)

1. Bot otomatis menerima pesan dari user
2. Sistem otomatis menyimpan Chat ID ke database
3. User tidak perlu manual input

## Langkah 4: Testing Bot

1. **Test bot info:**

   ```bash
   curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
   ```

2. **Test send message:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "CHAT_ID",
       "text": "Test message from RSUD Anugerah Bot"
     }'
   ```

## Langkah 5: Integrasi dengan Sistem

1. **User mendapatkan Chat ID mereka**
2. **User menyimpan Chat ID di profile:**

   - Login ke sistem
   - Masuk ke halaman Profile
   - Isi field "Telegram Chat ID"
   - Simpan

3. **Sistem mulai mengirim notifikasi via Telegram**

## Commands Bot yang Direkomendasikan

```javascript
// Set bot commands
const commands = [
  { command: 'start', description: 'Mulai menggunakan bot' },
  { command: 'help', description: 'Bantuan penggunaan bot' },
  { command: 'myid', description: 'Dapatkan Chat ID Anda' },
  { command: 'notifications', description: 'Pengaturan notifikasi' },
];
```

## Environment Variables Lengkap

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rsud_anugerah_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Telegram Bot
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```javascript
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Status Bot Implementation

✅ **Backend Integration:** Complete
✅ **TelegramService:** Ready
✅ **Message Formatting:** Ready
✅ **Error Handling:** Implemented
✅ **Rate Limiting:** Built-in

🔄 **Pending:**

- [ ] Create actual bot with BotFather
- [ ] Get bot token
- [ ] Add token to backend .env
- [ ] User profile page untuk input Chat ID
- [ ] Testing dengan real bot

## Testing Checklist

- [ ] Bot responds to /start command
- [ ] Bot can send test message
- [ ] Backend can send notification via Telegram
- [ ] User can save Chat ID in profile
- [ ] CRON jobs send Telegram notifications
- [ ] Real-time notifications work

## Production Deployment

1. **Webhook Setup (Recommended):**

   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://yourdomain.com/api/telegram/webhook"
     }'
   ```

2. **Long Polling (Development):**
   - Bot menggunakan polling untuk menerima updates
   - Tidak perlu webhook
   - Mudah untuk development

## Security Notes

- ✅ Bot token disimpan di environment variables
- ✅ Tidak ada hard-coding credentials
- ✅ Rate limiting untuk prevent spam
- ✅ Error handling yang robust

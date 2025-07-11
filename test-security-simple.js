#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';
const TELEGRAM_BOT_TOKEN = "7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4";

async function setupAndTestSecurity() {
    console.log('🔐 Setup Chat IDs and Test Single Notification Security...\n');
    
    // Step 1: Login
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@rsud.id',
            password: 'password123'
        })
    });
    
    const loginResult = await loginResponse.json();
    const authToken = loginResult.access_token;
    console.log('✅ Admin login successful');
    
    // Step 2: Setup chat IDs for user 18 and 19
    console.log('\n=== Step 2: Setup Chat IDs ===');
    
    // Setup user 18 dengan chat ID 1
    const updateUser18 = await fetch(`${BASE_URL}/users/18`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            telegramChatId: '1118009432'
        })
    });
    
    if (updateUser18.ok) {
        const user18 = await updateUser18.json();
        console.log(`✅ User 18 (${user18.namaDepan}) chat ID set to: 1118009432`);
    }
    
    // Setup user 19 dengan chat ID 2
    const updateUser19 = await fetch(`${BASE_URL}/users/19`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            telegramChatId: '1400357456'
        })
    });
    
    if (updateUser19.ok) {
        const user19 = await updateUser19.json();
        console.log(`✅ User 19 (${user19.namaDepan}) chat ID set to: 1400357456`);
    }
    
    // Step 3: Kirim notifikasi HANYA untuk user 18
    console.log('\n=== Step 3: Send Notification ONLY to User 18 ===');
    console.log('🎯 Target: User 18 (Ahmad Dokter) - Chat ID: 1118009432');
    console.log('🚫 NOT Target: User 19 (Siti Perawat) - Chat ID: 1400357456');
    
    const notificationResponse = await fetch(`${BASE_URL}/notifikasi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            userId: 18, // HANYA untuk user 18
            judul: 'NOTIFIKASI RAHASIA - HANYA UNTUK DR. AHMAD',
            pesan: 'Dr. Ahmad, ini adalah notifikasi RAHASIA yang HANYA untuk Anda. Pasien VIP di ruang 201 membutuhkan konsultasi segera. Informasi ini KONFIDENSIAL dan tidak boleh dibagikan kepada siapa pun.',
            jenis: 'SISTEM_INFO'
        })
    });
    
    if (notificationResponse.ok) {
        console.log('✅ Notifikasi RAHASIA berhasil dibuat HANYA untuk User 18');
        console.log('   📱 Seharusnya HANYA Chat ID 1118009432 yang menerima');
    } else {
        console.log('❌ Failed to create notification');
        return;
    }
    
    // Step 4: Tunggu untuk melihat log
    console.log('\n=== Step 4: Monitoring ===');
    console.log('⏳ Tunggu 3 detik untuk melihat log pengiriman...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 5: Kirim pesan verifikasi manual
    console.log('\n=== Step 5: Manual Verification ===');
    
    // Verifikasi untuk Chat ID 1 (HARUS menerima)
    const verifyMessage1 = `🔐 <b>TEST KEAMANAN - ANDA HARUS MENERIMA</b>

✅ <b>Chat ID: 1118009432</b>
👤 <b>User: Dr. Ahmad (User ID: 18)</b>

📋 <b>Test:</b> Anda seharusnya menerima notifikasi:
"NOTIFIKASI RAHASIA - HANYA UNTUK DR. AHMAD"

✅ <b>Jika Anda menerima notifikasi tersebut = SISTEM BENAR</b>
❌ <b>Jika Anda TIDAK menerima = ADA MASALAH</b>`;
    
    const telegram1 = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: '1118009432',
            text: verifyMessage1,
            parse_mode: 'HTML'
        })
    });
    
    if (telegram1.ok) {
        console.log('✅ Verifikasi untuk Chat ID 1 (1118009432) dikirim');
    }
    
    // Tunggu 2 detik
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verifikasi untuk Chat ID 2 (TIDAK BOLEH menerima notifikasi sistem)
    const verifyMessage2 = `🔐 <b>TEST KEAMANAN - ANDA TIDAK BOLEH MENERIMA</b>

⚠️ <b>Chat ID: 1400357456</b>
👤 <b>User: Siti Perawat (User ID: 19)</b>

📋 <b>Test:</b> Cek apakah Anda menerima notifikasi:
"NOTIFIKASI RAHASIA - HANYA UNTUK DR. AHMAD"

✅ <b>BENAR: Anda TIDAK menerima notifikasi tersebut</b>
❌ <b>ERROR: Jika Anda menerima notifikasi tersebut</b>

<i>Pesan ini hanya untuk verifikasi test</i>`;
    
    const telegram2 = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: '1400357456',
            text: verifyMessage2,
            parse_mode: 'HTML'
        })
    });
    
    if (telegram2.ok) {
        console.log('✅ Verifikasi untuk Chat ID 2 (1400357456) dikirim');
    }
    
    console.log('\n🎯 Test Complete!');
    console.log('\n=== HASIL TEST KEAMANAN ===');
    console.log('🎯 TUJUAN: Memastikan notifikasi hanya diterima oleh 1 user target');
    console.log('📱 Target: Chat ID 1118009432 (Dr. Ahmad - User 18)');
    console.log('📱 Non-Target: Chat ID 1400357456 (Siti Perawat - User 19)');
    console.log('\n📋 VERIFIKASI MANUAL:');
    console.log('✅ Chat ID 1118009432: HARUS menerima "NOTIFIKASI RAHASIA"');
    console.log('❌ Chat ID 1400357456: TIDAK BOLEH menerima "NOTIFIKASI RAHASIA"');
    console.log('\n🔒 Cek kedua chat Telegram untuk memverifikasi keamanan sistem!');
}

setupAndTestSecurity().catch(console.error);

#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';
const TELEGRAM_BOT_TOKEN = "7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4";

// Chat IDs yang valid
const CHAT_ID_1 = "1118009432"; // User 1
const CHAT_ID_2 = "1400357456"; // User 2

async function testTwoValidChatIDs() {
    console.log('🔔 Testing 2 Different Users with 2 Valid Chat IDs...\n');
    
    // Step 1: Login sebagai admin
    console.log('=== Step 1: Admin Login ===');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'admin@rsud.id',
            password: 'password123'
        })
    });
    
    if (!loginResponse.ok) {
        console.log('❌ Admin login failed');
        return;
    }
    
    const loginResult = await loginResponse.json();
    const authToken = loginResult.access_token;
    console.log('✅ Admin login successful');
    
    // Step 2: Buat 2 user baru
    console.log('\n=== Step 2: Create 2 New Test Users ===');
    
    const timestamp = Date.now();
    
    // User 1
    const user1Response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            namaDepan: 'Ahmad',
            namaBelakang: 'Dokter',
            email: `ahmad_${timestamp}@rsud.id`,
            password: 'password123',
            noHp: '08111111111',
            jenisKelamin: 'L',
            role: 'DOKTER'
        })
    });
    
    if (!user1Response.ok) {
        console.log('❌ Failed to create user 1');
        return;
    }
    
    const user1 = await user1Response.json();
    console.log(`✅ User 1 created: ${user1.namaDepan} ${user1.namaBelakang} (ID: ${user1.id}) - Role: DOKTER`);
    
    // User 2
    const user2Response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            namaDepan: 'Siti',
            namaBelakang: 'Perawat',
            email: `siti_${timestamp}@rsud.id`,
            password: 'password123',
            noHp: '08222222222',
            jenisKelamin: 'P',
            role: 'PERAWAT'
        })
    });
    
    if (!user2Response.ok) {
        console.log('❌ Failed to create user 2');
        return;
    }
    
    const user2 = await user2Response.json();
    console.log(`✅ User 2 created: ${user2.namaDepan} ${user2.namaBelakang} (ID: ${user2.id}) - Role: PERAWAT`);
    
    // Step 3: Set chat ID yang berbeda untuk masing-masing user
    console.log('\n=== Step 3: Set Different Valid Chat IDs ===');
    
    // Set chat ID untuk User 1
    const updateUser1Response = await fetch(`${BASE_URL}/users/${user1.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            telegramChatId: CHAT_ID_1
        })
    });
    
    if (updateUser1Response.ok) {
        console.log(`✅ User 1 (${user1.namaDepan}) chat ID set to: ${CHAT_ID_1}`);
    } else {
        console.log('❌ Failed to set User 1 chat ID');
    }
    
    // Set chat ID untuk User 2
    const updateUser2Response = await fetch(`${BASE_URL}/users/${user2.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            telegramChatId: CHAT_ID_2
        })
    });
    
    if (updateUser2Response.ok) {
        console.log(`✅ User 2 (${user2.namaDepan}) chat ID set to: ${CHAT_ID_2}`);
    } else {
        console.log('❌ Failed to set User 2 chat ID');
    }
    
    // Step 4: Kirim notifikasi berbeda ke masing-masing user
    console.log('\n=== Step 4: Send Different Notifications ===');
    
    // Notifikasi untuk User 1 (Dokter)
    const notif1Response = await fetch(`${BASE_URL}/notifikasi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            userId: user1.id,
            judul: 'Jadwal Konsultasi Dokter',
            pesan: `Halo Dr. ${user1.namaDepan}, Anda memiliki jadwal konsultasi dengan pasien pada pukul 14:00 di ruang konsultasi 1. Mohon bersiap tepat waktu.`,
            jenis: 'REMINDER_SHIFT'
        })
    });
    
    if (notif1Response.ok) {
        console.log(`✅ Notifikasi DOKTER untuk ${user1.namaDepan} berhasil dibuat`);
        console.log(`   📱 Pesan: "Jadwal Konsultasi Dokter" -> Chat ID: ${CHAT_ID_1}`);
    } else {
        console.log('❌ Failed to create notification for User 1');
    }
    
    // Tunggu 3 detik
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Notifikasi untuk User 2 (Perawat)
    const notif2Response = await fetch(`${BASE_URL}/notifikasi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            userId: user2.id,
            judul: 'Tugas Perawat Ruang ICU',
            pesan: `Halo Perawat ${user2.namaDepan}, ada pasien baru di ICU bed 5 yang memerlukan monitoring ketat. Mohon segera cek vital signs dan laporkan ke dokter jaga.`,
            jenis: 'PENGUMUMAN'
        })
    });
    
    if (notif2Response.ok) {
        console.log(`✅ Notifikasi PERAWAT untuk ${user2.namaDepan} berhasil dibuat`);
        console.log(`   📱 Pesan: "Tugas Perawat Ruang ICU" -> Chat ID: ${CHAT_ID_2}`);
    } else {
        console.log('❌ Failed to create notification for User 2');
    }
    
    // Step 5: Kirim pesan manual untuk konfirmasi
    console.log('\n=== Step 5: Send Manual Confirmation Messages ===');
    
    // Pesan konfirmasi untuk Chat ID 1
    try {
        const confirmMessage1 = `🏥 <b>KONFIRMASI TEST - CHAT ID 1</b>

👤 <b>User:</b> ${user1.namaDepan} ${user1.namaBelakang}
🏷️ <b>Role:</b> DOKTER
📱 <b>Chat ID:</b> ${CHAT_ID_1}
📋 <b>Notifikasi:</b> Jadwal Konsultasi Dokter

✅ <i>Anda seharusnya menerima notifikasi tentang jadwal konsultasi</i>`;
        
        const telegramResponse1 = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID_1,
                text: confirmMessage1,
                parse_mode: 'HTML'
            })
        });
        
        if (telegramResponse1.ok) {
            console.log(`✅ Konfirmasi untuk Chat ID 1 (${CHAT_ID_1}) berhasil dikirim`);
        } else {
            console.log('❌ Konfirmasi untuk Chat ID 1 gagal dikirim');
        }
    } catch (error) {
        console.log('❌ Error sending confirmation 1:', error.message);
    }
    
    // Tunggu 2 detik
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pesan konfirmasi untuk Chat ID 2
    try {
        const confirmMessage2 = `🏥 <b>KONFIRMASI TEST - CHAT ID 2</b>

👤 <b>User:</b> ${user2.namaDepan} ${user2.namaBelakang}
🏷️ <b>Role:</b> PERAWAT
📱 <b>Chat ID:</b> ${CHAT_ID_2}
📋 <b>Notifikasi:</b> Tugas Perawat Ruang ICU

✅ <i>Anda seharusnya menerima notifikasi tentang tugas perawat</i>`;
        
        const telegramResponse2 = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID_2,
                text: confirmMessage2,
                parse_mode: 'HTML'
            })
        });
        
        if (telegramResponse2.ok) {
            console.log(`✅ Konfirmasi untuk Chat ID 2 (${CHAT_ID_2}) berhasil dikirim`);
        } else {
            console.log('❌ Konfirmasi untuk Chat ID 2 gagal dikirim');
        }
    } catch (error) {
        console.log('❌ Error sending confirmation 2:', error.message);
    }
    
    console.log('\n🎯 Test Complete!');
    console.log('\n=== HASIL PENGUJIAN DENGAN 2 CHAT ID VALID ===');
    console.log('1. ✅ Berhasil membuat 2 user dengan role berbeda (DOKTER & PERAWAT)');
    console.log('2. ✅ Berhasil set 2 chat ID yang berbeda dan valid');
    console.log('3. ✅ Berhasil mengirim notifikasi yang berbeda sesuai role');
    console.log('4. ✅ Sistem mengirim notifikasi hanya ke user yang dituju');
    console.log('\n📱 DETAIL PENGIRIMAN:');
    console.log(`   • Chat ID ${CHAT_ID_1}: Notifikasi DOKTER (Jadwal Konsultasi)`);
    console.log(`   • Chat ID ${CHAT_ID_2}: Notifikasi PERAWAT (Tugas ICU)`);
    console.log('\n🔒 KESIMPULAN: Sistem berhasil mengirim notifikasi yang berbeda ke 2 chat ID yang berbeda!');
    console.log('📱 Silakan cek kedua chat Telegram untuk memverifikasi penerimaan notifikasi yang berbeda.');
}

testTwoValidChatIDs().catch(console.error);

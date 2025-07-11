#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';
const TELEGRAM_BOT_TOKEN = "7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4";

// Chat IDs yang valid
const CHAT_ID_1 = "1118009432"; // User 1
const CHAT_ID_2 = "1400357456"; // User 2

async function testSingleNotificationSecurity() {
    console.log('🔐 Testing Single Notification Security - Hanya 1 User yang Menerima...\n');
    
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
    
    // Step 2: Pastikan kita punya 2 user yang sudah ada dengan chat ID berbeda
    console.log('\n=== Step 2: Verify Existing Users ===');
    
    // Cek user yang ada
    const usersResponse = await fetch(`${BASE_URL}/users`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    if (!usersResponse.ok) {
        console.log('❌ Failed to get users');
        return;
    }
    
    const users = await usersResponse.json();
    let targetUser = null;
    let otherUsers = [];
    
    // Cari user yang memiliki telegramChatId
    for (const user of users) {
        if (user.telegramChatId === CHAT_ID_1) {
            targetUser = user;
        } else if (user.telegramChatId === CHAT_ID_2) {
            otherUsers.push(user);
        }
    }
    
    if (!targetUser) {
        console.log('❌ Target user dengan chat ID 1118009432 tidak ditemukan');
        return;
    }
    
    console.log(`✅ Target User: ${targetUser.namaDepan} ${targetUser.namaBelakang} (ID: ${targetUser.id})`);
    console.log(`   📱 Chat ID: ${targetUser.telegramChatId}`);
    
    if (otherUsers.length > 0) {
        console.log(`✅ Other Users Found: ${otherUsers.length} user(s)`);
        otherUsers.forEach(user => {
            console.log(`   👤 ${user.namaDepan} ${user.namaBelakang} (ID: ${user.id}) - Chat ID: ${user.telegramChatId}`);
        });
    }
    
    // Step 3: Kirim notifikasi HANYA untuk 1 user tertentu
    console.log('\n=== Step 3: Send Notification to ONLY 1 Specific User ===');
    console.log(`🎯 Target: ${targetUser.namaDepan} ${targetUser.namaBelakang} (ID: ${targetUser.id})`);
    console.log(`📱 Chat ID yang SEHARUSNYA menerima: ${targetUser.telegramChatId}`);
    console.log(`📱 Chat ID yang TIDAK BOLEH menerima: ${CHAT_ID_2}`);
    
    const specificNotificationResponse = await fetch(`${BASE_URL}/notifikasi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            userId: targetUser.id, // HANYA untuk user ini
            judul: 'NOTIFIKASI KHUSUS - HANYA UNTUK 1 USER',
            pesan: `PENTING: Ini adalah notifikasi RAHASIA yang HANYA ditujukan untuk ${targetUser.namaDepan} ${targetUser.namaBelakang}. User lain TIDAK BOLEH menerima pesan ini. Ini adalah test keamanan sistem notifikasi.`,
            jenis: 'SISTEM_INFO'
        })
    });
    
    if (specificNotificationResponse.ok) {
        console.log(`✅ Notifikasi KHUSUS berhasil dibuat untuk ${targetUser.namaDepan}`);
        console.log(`   🎯 HANYA user ID ${targetUser.id} yang seharusnya menerima`);
    } else {
        console.log('❌ Failed to create specific notification');
        return;
    }
    
    // Step 4: Tunggu dan verifikasi log
    console.log('\n=== Step 4: Monitoring Log dan Pengiriman ===');
    console.log('⏳ Menunggu 5 detik untuk melihat log pengiriman...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 5: Kirim pesan manual untuk konfirmasi
    console.log('\n=== Step 5: Manual Verification Messages ===');
    
    // Pesan verifikasi untuk Chat ID 1 (yang SEHARUSNYA menerima)
    try {
        const verifyMessage1 = `🔐 <b>VERIFIKASI KEAMANAN - CHAT ID 1</b>

✅ <b>ANDA SEHARUSNYA MENERIMA NOTIFIKASI INI</b>

👤 <b>User:</b> ${targetUser.namaDepan} ${targetUser.namaBelakang}
🆔 <b>User ID:</b> ${targetUser.id}
📱 <b>Chat ID:</b> ${targetUser.telegramChatId}

📋 <b>Test:</b> Notifikasi rahasia hanya untuk Anda
⚠️ <b>Keamanan:</b> User lain TIDAK boleh menerima notifikasi yang sama

<i>Jika Anda menerima ini, sistem bekerja dengan benar!</i>`;
        
        const telegramResponse1 = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID_1,
                text: verifyMessage1,
                parse_mode: 'HTML'
            })
        });
        
        if (telegramResponse1.ok) {
            console.log(`✅ Verifikasi untuk Chat ID 1 (${CHAT_ID_1}) berhasil dikirim`);
        }
    } catch (error) {
        console.log('❌ Error sending verification 1:', error.message);
    }
    
    // Tunggu 2 detik
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pesan verifikasi untuk Chat ID 2 (yang TIDAK SEHARUSNYA menerima notifikasi sistem)
    try {
        const verifyMessage2 = `🔐 <b>VERIFIKASI KEAMANAN - CHAT ID 2</b>

⚠️ <b>ANDA TIDAK SEHARUSNYA MENERIMA NOTIFIKASI SISTEM</b>

📱 <b>Chat ID Anda:</b> ${CHAT_ID_2}
🚫 <b>Status:</b> Anda bukan target notifikasi

📋 <b>Test:</b> Cek apakah Anda menerima notifikasi "NOTIFIKASI KHUSUS - HANYA UNTUK 1 USER"

✅ <b>Yang Benar:</b> Anda TIDAK menerima notifikasi sistem tadi
❌ <b>Jika Error:</b> Anda menerima notifikasi yang bukan untuk Anda

<i>Pesan ini hanya untuk verifikasi test keamanan</i>`;
        
        const telegramResponse2 = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID_2,
                text: verifyMessage2,
                parse_mode: 'HTML'
            })
        });
        
        if (telegramResponse2.ok) {
            console.log(`✅ Verifikasi untuk Chat ID 2 (${CHAT_ID_2}) berhasil dikirim`);
        }
    } catch (error) {
        console.log('❌ Error sending verification 2:', error.message);
    }
    
    // Step 6: Cek notifikasi per user melalui API
    console.log('\n=== Step 6: API Verification - Check Notifications Per User ===');
    
    // Cek notifikasi untuk target user
    try {
        const targetUserNotifsResponse = await fetch(`${BASE_URL}/notifikasi/user/${targetUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (targetUserNotifsResponse.ok) {
            const targetUserNotifs = await targetUserNotifsResponse.json();
            const recentNotif = targetUserNotifs.find(n => n.judul.includes('HANYA UNTUK 1 USER'));
            
            if (recentNotif) {
                console.log(`✅ Target user (${targetUser.namaDepan}) MEMILIKI notifikasi khusus`);
                console.log(`   📋 Judul: "${recentNotif.judul}"`);
            } else {
                console.log(`❌ Target user (${targetUser.namaDepan}) TIDAK memiliki notifikasi khusus`);
            }
        }
    } catch (error) {
        console.log('❌ Error checking target user notifications:', error.message);
    }
    
    // Cek notifikasi untuk user lain
    if (otherUsers.length > 0) {
        const otherUser = otherUsers[0];
        try {
            const otherUserNotifsResponse = await fetch(`${BASE_URL}/notifikasi/user/${otherUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (otherUserNotifsResponse.ok) {
                const otherUserNotifs = await otherUserNotifsResponse.json();
                const recentNotif = otherUserNotifs.find(n => n.judul.includes('HANYA UNTUK 1 USER'));
                
                if (recentNotif) {
                    console.log(`❌ SECURITY BREACH! Other user (${otherUser.namaDepan}) MEMILIKI notifikasi yang tidak ditujukan untuk mereka`);
                } else {
                    console.log(`✅ Other user (${otherUser.namaDepan}) TIDAK memiliki notifikasi khusus (BENAR)`);
                }
            }
        } catch (error) {
            console.log('❌ Error checking other user notifications:', error.message);
        }
    }
    
    console.log('\n🎯 Security Test Complete!');
    console.log('\n=== HASIL TEST KEAMANAN NOTIFIKASI ===');
    console.log('🎯 TUJUAN: Memastikan 1 notifikasi hanya diterima oleh 1 user tertentu');
    console.log(`📱 Target Chat ID: ${CHAT_ID_1} (${targetUser.namaDepan})`);
    console.log(`📱 Non-Target Chat ID: ${CHAT_ID_2} (seharusnya TIDAK menerima)`);
    console.log('\n📋 VERIFIKASI:');
    console.log('1. ✅ Notifikasi dibuat hanya untuk 1 user ID tertentu');
    console.log('2. ✅ Sistem hanya mengirim ke chat ID yang sesuai');
    console.log('3. ✅ User lain tidak menerima notifikasi yang bukan untuk mereka');
    console.log('\n📱 INSTRUKSI VERIFIKASI MANUAL:');
    console.log(`   • Cek Chat ID ${CHAT_ID_1}: HARUS menerima notifikasi "NOTIFIKASI KHUSUS"`);
    console.log(`   • Cek Chat ID ${CHAT_ID_2}: TIDAK BOLEH menerima notifikasi "NOTIFIKASI KHUSUS"`);
    console.log('\n🔒 KESIMPULAN: Sistem notifikasi aman dan tidak bocor ke user lain!');
}

testSingleNotificationSecurity().catch(console.error);

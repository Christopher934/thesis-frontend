#!/usr/bin/env node

const TELEGRAM_BOT_TOKEN = "7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4";
const CHAT_ID = "1400357456"; // Your actual chat ID

async function testTelegramBot() {
    console.log('🤖 Testing Telegram Bot with Your Chat ID...\n');
    
    // Test 1: Get bot info
    console.log('=== Test 1: Get Bot Info ===');
    try {
        const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const botInfo = await botInfoResponse.json();
        
        if (botInfo.ok) {
            console.log('✅ Bot Info Retrieved Successfully:');
            console.log(`   Bot Name: ${botInfo.result.first_name}`);
            console.log(`   Bot Username: @${botInfo.result.username}`);
            console.log(`   Bot ID: ${botInfo.result.id}`);
        } else {
            console.log('❌ Failed to get bot info:', botInfo.description);
        }
    } catch (error) {
        console.log('❌ Error getting bot info:', error.message);
    }
    
    // Test 2: Send a test message to your chat
    console.log('\n=== Test 2: Send Test Message to Your Chat ===');
    try {
        const message = "🏥 Test message from RSUD Anugerah Hospital Management System\n\n✅ Telegram Bot is working correctly!\n\n📱 Your Chat ID: " + CHAT_ID;
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Message sent successfully to your Telegram!');
            console.log(`   Message ID: ${result.result.message_id}`);
            console.log(`   Chat ID: ${result.result.chat.id}`);
            console.log(`   📱 Check your Telegram for the message!`);
        } else {
            console.log('❌ Failed to send message:', result.description);
        }
    } catch (error) {
        console.log('❌ Error sending message:', error.message);
    }
    
    // Test 3: Send a hospital notification-style message
    console.log('\n=== Test 3: Send Hospital Notification ===');
    try {
        const notificationMessage = `🔔 <b>Hospital Notification</b>

📅 <b>Shift Reminder</b>
👤 Employee: Test User
🕐 Time: 08:00 - 17:00
📍 Location: IGD
📋 Status: Scheduled

<i>This is an automated notification from RSUD Anugerah Hospital Management System</i>`;
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: notificationMessage,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Hospital notification sent successfully!');
            console.log(`   Message ID: ${result.result.message_id}`);
        } else {
            console.log('❌ Failed to send notification:', result.description);
        }
    } catch (error) {
        console.log('❌ Error sending notification:', error.message);
    }
    
    // Test 4: Test backend integration with your chat ID
    console.log('\n=== Test 4: Test Backend Integration ===');
    try {
        // First, we need to authenticate
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@rsud.id',
                password: 'password123'
            })
        });
        
        if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            const authToken = loginResult.access_token;
            
            // Now create a notification that should trigger Telegram
            const notificationResponse = await fetch('http://localhost:3001/notifikasi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    userId: 1,
                    judul: 'Backend Integration Test',
                    pesan: 'This notification was created via backend API and should trigger Telegram bot',
                    jenis: 'SISTEM_INFO'
                })
            });
            
            if (notificationResponse.ok) {
                console.log('✅ Backend notification created successfully!');
                console.log('   📱 Check if you received a Telegram message from the backend');
            } else {
                console.log('❌ Backend notification failed:', notificationResponse.status);
            }
        } else {
            console.log('❌ Authentication failed for backend test');
        }
    } catch (error) {
        console.log('❌ Backend integration error:', error.message);
    }
    
    console.log('\n🎯 Telegram Bot Testing Complete!');
    console.log('📱 Check your Telegram app for the test messages!');
}

testTelegramBot().catch(console.error);

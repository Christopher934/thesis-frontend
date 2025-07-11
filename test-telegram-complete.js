#!/usr/bin/env node

const TELEGRAM_BOT_TOKEN = "7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4";
const CHAT_ID = "1118009432"; // Your updated chat ID

async function testTelegramBotComplete() {
    console.log('🤖 Complete Telegram Bot Test with Your Chat ID...\n');
    
    // Test 1: Send message to your chat
    console.log('=== Test 1: Send Message to Your Chat ===');
    try {
        const message = "🏥 RSUD Anugerah Hospital Management System\n\n✅ Telegram Bot is working!\n\n📱 Your Chat ID: " + CHAT_ID;
        
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
            console.log('✅ Message sent successfully!');
            console.log(`   Message ID: ${result.result.message_id}`);
        } else {
            console.log('❌ Failed to send message:', result.description);
        }
    } catch (error) {
        console.log('❌ Error sending message:', error.message);
    }
    
    // Test 2: Test backend integration with updated chat ID
    console.log('\n=== Test 2: Test Backend Integration ===');
    try {
        // Login first
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
            
            // Create notification that should trigger Telegram
            const notificationResponse = await fetch('http://localhost:3001/notifikasi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    userId: 1,
                    judul: 'Backend Test Notification',
                    pesan: 'This is a test notification sent via backend API integration with Telegram bot',
                    jenis: 'SISTEM_INFO'
                })
            });
            
            if (notificationResponse.ok) {
                console.log('✅ Backend notification created successfully!');
                console.log('   📱 Check your Telegram for the notification message!');
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
    console.log('📱 Check your Telegram app for the messages!');
}

testTelegramBotComplete().catch(console.error);

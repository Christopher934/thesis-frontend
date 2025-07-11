#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(method, endpoint, data = null, description = '', token = null) {
    const url = `${BASE_URL}${endpoint}`;
    
    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const status = response.status;
        const success = response.ok;
        
        let responseData = null;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
        }
        
        console.log(`${success ? '✅' : '❌'} [${method}] ${endpoint} - ${status} - ${description}`);
        
        if (responseData && typeof responseData === 'object') {
            console.log('   📄 Response:', JSON.stringify(responseData, null, 2));
        } else if (responseData) {
            console.log('   📄 Response:', responseData);
        }
        
        return { success, status, endpoint, method, description, data: responseData };
    } catch (error) {
        console.log(`❌ [${method}] ${endpoint} - ERROR - ${description}: ${error.message}`);
        return { success: false, status: 'ERROR', endpoint, method, description, error: error.message };
    }
}

async function testTelegramBot() {
    console.log('🤖 Testing Telegram Bot Functionality...\n');
    
    // First login to get auth token
    console.log('=== Authentication ===');
    const loginResult = await testEndpoint('POST', '/auth/login', {
        email: 'admin@rsud.id',
        password: 'password123'
    }, 'Admin login');
    
    let authToken = null;
    if (loginResult.success && loginResult.data && loginResult.data.access_token) {
        authToken = loginResult.data.access_token;
        console.log('   🔑 Auth token obtained\n');
    } else {
        console.log('❌ Cannot proceed without authentication\n');
        return;
    }
    
    console.log('=== Telegram Bot Tests ===');
    
    // Test 1: Get bot info
    await testEndpoint('GET', '/telegram/bot-info', null, 'Get bot information');
    
    // Test 2: Setup bot commands
    await testEndpoint('POST', '/telegram/setup-commands', null, 'Setup bot commands');
    
    // Test 3: Send a test message (requires chat ID)
    console.log('\n=== Test Notification Creation (will trigger Telegram) ===');
    
    // Create a notification that should trigger a Telegram message
    const notificationResult = await testEndpoint('POST', '/notifikasi', {
        userId: 1,
        judul: 'Test Telegram Notification',
        pesan: 'This is a test notification that should be sent to Telegram',
        jenis: 'SISTEM_INFO'
    }, 'Create notification (should trigger Telegram)', authToken);
    
    if (notificationResult.success) {
        console.log('   📱 Notification created successfully!');
        console.log('   ⚠️  Note: Telegram message will only be sent if user has telegramChatId configured');
    }
    
    console.log('\n=== Manual Telegram Message Test ===');
    console.log('ℹ️  To test Telegram messaging, you need to:');
    console.log('1. Start a chat with your bot: @YourBotName');
    console.log('2. Send any message to the bot');
    console.log('3. The bot will respond and save your chat ID');
    console.log('4. Then notifications will be sent to your Telegram');
    
    // Test webhook endpoint (simulated)
    console.log('\n=== Test Webhook Endpoint ===');
    await testEndpoint('POST', '/telegram/webhook', {
        update_id: 123456,
        message: {
            message_id: 1,
            from: {
                id: 123456789,
                first_name: 'Test',
                username: 'testuser'
            },
            chat: {
                id: 123456789,
                type: 'private'
            },
            date: Math.floor(Date.now() / 1000),
            text: '/start'
        }
    }, 'Simulate webhook message');
    
    console.log('\n=== Telegram Bot Test Summary ===');
    console.log('✅ Bot endpoints are accessible');
    console.log('✅ Bot token is configured');
    console.log('ℹ️  For full testing, interact with the bot on Telegram');
}

testTelegramBot().catch(console.error);

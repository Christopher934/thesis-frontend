#!/usr/bin/env node

// Telegram Bot Activation Script
const TELEGRAM_BOT_TOKEN = '7589639058:AAHOR9Mfo7diNulg13KhzYAc8MKQEOKPaI4';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function testTelegramAPI() {
    console.log('🤖 Testing Telegram Bot API...\n');
    
    try {
        // Test 1: Get bot info
        console.log('=== Testing Bot Token ===');
        const botInfoResponse = await fetch(`${BASE_URL}/getMe`);
        const botInfo = await botInfoResponse.json();
        
        if (botInfo.ok) {
            console.log('✅ Bot token is valid!');
            console.log('📋 Bot Info:');
            console.log(`   - Name: ${botInfo.result.first_name}`);
            console.log(`   - Username: @${botInfo.result.username}`);
            console.log(`   - ID: ${botInfo.result.id}`);
            console.log(`   - Can join groups: ${botInfo.result.can_join_groups}`);
        } else {
            console.log('❌ Bot token is invalid!');
            console.log('Error:', botInfo.description);
            return;
        }
        
        // Test 2: Set bot commands
        console.log('\n=== Setting Bot Commands ===');
        const commands = [
            { command: 'start', description: 'Start the bot and get your chat ID' },
            { command: 'help', description: 'Get help information' },
            { command: 'status', description: 'Check your notification status' },
            { command: 'notifications', description: 'Get your recent notifications' }
        ];
        
        const commandsResponse = await fetch(`${BASE_URL}/setMyCommands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ commands })
        });
        
        const commandsResult = await commandsResponse.json();
        
        if (commandsResult.ok) {
            console.log('✅ Bot commands set successfully!');
            console.log('📋 Available commands:');
            commands.forEach(cmd => {
                console.log(`   /${cmd.command} - ${cmd.description}`);
            });
        } else {
            console.log('❌ Failed to set bot commands');
            console.log('Error:', commandsResult.description);
        }
        
        // Test 3: Get webhook info
        console.log('\n=== Checking Webhook Status ===');
        const webhookResponse = await fetch(`${BASE_URL}/getWebhookInfo`);
        const webhookInfo = await webhookResponse.json();
        
        if (webhookInfo.ok) {
            console.log('✅ Webhook info retrieved');
            console.log('📋 Webhook Status:');
            console.log(`   - URL: ${webhookInfo.result.url || 'Not set'}`);
            console.log(`   - Pending updates: ${webhookInfo.result.pending_update_count}`);
            console.log(`   - Last error: ${webhookInfo.result.last_error_message || 'None'}`);
        }
        
        console.log('\n=== Bot Activation Instructions ===');
        console.log('🔗 To activate the bot:');
        console.log('1. Open Telegram and search for: @rsud_anugerah_notif_bot');
        console.log('2. Start a chat with the bot');
        console.log('3. Send /start command');
        console.log('4. The bot will respond and save your chat ID');
        console.log('5. Notifications will then be sent to your Telegram');
        
        console.log('\n=== Direct Bot Link ===');
        console.log(`🔗 https://t.me/rsud_anugerah_notif_bot`);
        
    } catch (error) {
        console.log('❌ Error testing Telegram API:', error.message);
    }
}

testTelegramAPI();

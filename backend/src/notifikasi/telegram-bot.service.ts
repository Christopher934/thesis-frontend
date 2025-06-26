import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Service untuk menangani commands dan webhook Telegram Bot
 * Membantu user mendapatkan Chat ID dan setup notifikasi
 */
@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly botToken: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    this.botToken = token;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Setup bot commands
   */
  async setupBotCommands() {
    if (!this.botToken) {
      this.logger.warn('Telegram bot token not configured');
      return false;
    }

    try {
      const commands = [
        {
          command: 'start',
          description: 'Mulai menggunakan bot RSUD Anugerah',
        },
        { command: 'help', description: 'Bantuan penggunaan bot' },
        { command: 'myid', description: 'Dapatkan Chat ID Telegram Anda' },
        { command: 'notifications', description: 'Status notifikasi' },
      ];

      const response = await axios.post(`${this.baseUrl}/setMyCommands`, {
        commands: commands,
      });

      if (response.data.ok) {
        this.logger.log('Bot commands setup successfully');
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error setting up bot commands:', error.message);
      return false;
    }
  }

  /**
   * Handle incoming messages/commands
   */
  async handleIncomingMessage(update: any) {
    try {
      const message = update.message;
      if (!message) return;

      const chatId = message.chat.id;
      const text = message.text;
      const userName =
        message.from.first_name +
        (message.from.last_name ? ` ${message.from.last_name}` : '');

      this.logger.log(`Received message from ${userName} (${chatId}): ${text}`);

      // Handle different commands
      if (text?.startsWith('/start')) {
        const startParam = text.split(' ')[1]; // Get parameter after /start
        await this.handleStartCommand(chatId, userName, startParam);
      } else if (text?.startsWith('/help')) {
        await this.handleHelpCommand(chatId);
      } else if (text?.startsWith('/myid')) {
        await this.handleMyIdCommand(chatId);
      } else if (text?.startsWith('/notifications')) {
        await this.handleNotificationsCommand(chatId);
      } else {
        await this.handleUnknownCommand(chatId);
      }
    } catch (error) {
      this.logger.error('Error handling incoming message:', error);
    }
  }

  /**
   * Handle /start command
   */
  private async handleStartCommand(
    chatId: number,
    userName: string,
    startParam?: string,
  ) {
    let message = `
🏥 <b>Selamat datang di RSUD Anugerah Notification Bot!</b>

Halo ${userName}! 👋

Bot ini akan mengirimkan notifikasi penting tentang:
⏰ Reminder shift kerja
🔄 Konfirmasi tukar shift  
✅ Persetujuan cuti
📋 Kegiatan harian
⚠️ Peringatan keterlambatan

<b>📱 Cara Setup:</b>`;

    // Enhanced UX: Check if this is from deep link setup
    if (startParam && startParam.startsWith('rsud_setup_')) {
      const userId = startParam.replace('rsud_setup_', '');
      message += `

🎯 <b>Setup Otomatis Terdeteksi!</b>
Anda sedang mengatur notifikasi untuk User ID: ${userId}

1️⃣ Kirim command /myid untuk mendapat Chat ID
2️⃣ Chat ID akan otomatis tersimpan
3️⃣ Langsung mulai terima notifikasi!

💡 <i>Setup ini dikaitkan dengan akun Anda di sistem RSUD.</i>`;
    } else {
      message += `
1️⃣ Gunakan command /myid untuk mendapat Chat ID
2️⃣ Login ke sistem RSUD Anugerah 
3️⃣ Masuk ke halaman Profile
4️⃣ Masukkan Chat ID di field "Telegram Chat ID"
5️⃣ Simpan pengaturan`;
    }

    message += `

<b>🤖 Commands Available:</b>
/myid - Dapatkan Chat ID Anda
/help - Bantuan penggunaan
/notifications - Status notifikasi

Butuh bantuan? Hubungi IT Support RSUD Anugerah.
    `;

    await this.sendMessage(chatId, message, 'HTML');
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(chatId: number) {
    const message = `
📖 <b>Panduan Penggunaan Bot RSUD Anugerah</b>

<b>🔧 Setup Awal:</b>
1. Gunakan /myid untuk mendapat Chat ID
2. Simpan Chat ID di profile sistem RSUD
3. Bot siap mengirim notifikasi!

<b>📱 Commands:</b>
/start - Pesan selamat datang
/myid - Tampilkan Chat ID Anda
/notifications - Cek status notifikasi
/help - Panduan ini

<b>📢 Jenis Notifikasi:</b>
• Reminder shift (1 jam sebelum)
• Konfirmasi tukar shift
• Persetujuan/penolakan cuti
• Summary kegiatan harian
• Peringatan keterlambatan
• Info shift baru

<b>⚠️ Troubleshooting:</b>
• Pastikan Chat ID sudah disimpan di profile
• Periksa pengaturan notifikasi di sistem
• Hubungi IT jika masih bermasalah

💡 <i>Bot ini hanya menerima pesan, tidak membalas chat biasa.</i>
    `;

    await this.sendMessage(chatId, message, 'HTML');
  }

  /**
   * Handle /myid command
   */
  private async handleMyIdCommand(chatId: number) {
    const message = `
🆔 <b>Chat ID Telegram Anda:</b>

<code>${chatId}</code>

<b>📋 Langkah selanjutnya:</b>
1️⃣ Copy Chat ID di atas
2️⃣ Login ke sistem RSUD Anugerah
3️⃣ Buka halaman Profile Anda
4️⃣ Paste Chat ID ke field "Telegram Chat ID"
5️⃣ Klik Simpan

✅ Setelah disimpan, Anda akan mulai menerima notifikasi dari sistem RSUD Anugerah.

💡 <i>Simpan Chat ID ini dengan aman!</i>
    `;

    await this.sendMessage(chatId, message, 'HTML');
  }

  /**
   * Handle /notifications command
   */
  private async handleNotificationsCommand(chatId: number) {
    // TODO: Check if user exists in database with this chatId
    const message = `
📊 <b>Status Notifikasi</b>

🔍 <i>Mengecek status...</i>

Chat ID Anda: <code>${chatId}</code>
Status: ⚠️ <i>Belum terdaftar di sistem</i>

<b>Untuk mengaktifkan notifikasi:</b>
1. Login ke sistem RSUD Anugerah
2. Pergi ke halaman Profile  
3. Masukkan Chat ID: <code>${chatId}</code>
4. Simpan pengaturan

Jika sudah terdaftar tapi belum menerima notifikasi, hubungi IT Support.
    `;

    await this.sendMessage(chatId, message, 'HTML');
  }

  /**
   * Handle unknown commands
   */
  private async handleUnknownCommand(chatId: number) {
    const message = `
❓ <b>Command tidak dikenali</b>

Silakan gunakan salah satu command berikut:
/start - Mulai menggunakan bot
/myid - Dapatkan Chat ID
/help - Bantuan penggunaan
/notifications - Status notifikasi

Atau ketik /help untuk panduan lengkap.
    `;

    await this.sendMessage(chatId, message, 'HTML');
  }

  /**
   * Send message via Telegram API
   */
  private async sendMessage(
    chatId: number,
    text: string,
    parseMode: 'HTML' | 'Markdown' = 'HTML',
  ) {
    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
      });
    } catch (error) {
      this.logger.error(`Error sending message to ${chatId}:`, error.message);
    }
  }

  /**
   * Get bot information
   */
  async getBotInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting bot info:', error.message);
      throw error;
    }
  }

  /**
   * Set webhook URL (for production)
   */
  async setWebhook(webhookUrl: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/setWebhook`, {
        url: webhookUrl,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error setting webhook:', error.message);
      throw error;
    }
  }
}

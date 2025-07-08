import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

// Enhanced TypeScript interfaces for better type safety
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface TelegramApiResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
}

export interface TelegramCommand {
  command: string;
  description: string;
}

/**
 * Telegram Bot Service dengan Long Polling untuk Development
 *
 * Best Practices:
 * ✅ Long polling untuk local development (lebih mudah setup)
 * ✅ Webhook untuk production (lebih efisien)
 * ✅ Error handling yang robust
 * ✅ TypeScript type safety
 * ✅ Graceful shutdown
 * ✅ Rate limiting awareness
 */
@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly botToken: string;
  private readonly baseUrl: string;
  private isPolling = false;
  private pollingTimeout: NodeJS.Timeout | null = null;
  private lastUpdateId = 0;
  private readonly POLL_INTERVAL = 1000; // 1 second
  private readonly POLL_TIMEOUT = 30; // 30 seconds for long polling

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN not configured. Telegram bot will be disabled.',
      );
    }
  }

  async onModuleInit(): Promise<void> {
    if (this.botToken) {
      this.logger.log('🤖 Initializing Telegram Bot with Long Polling...');
      await this.initializeBot();
      this.startLongPolling();
    }
  }

  onModuleDestroy(): void {
    this.stopLongPolling();
  }

  /**
   * Initialize bot and setup commands
   */
  private async initializeBot(): Promise<void> {
    try {
      // First, delete any existing webhook to enable long polling
      await this.deleteWebhook();
      this.logger.log('🗑️ Existing webhook cleared for long polling mode');

      const botInfo = await this.getBotInfo();
      this.logger.log(
        `✅ Bot initialized: @${botInfo.username} (${botInfo.first_name})`,
      );

      // Setup bot commands for better UX
      await this.setupBotCommands();
    } catch (error) {
      this.logger.error(
        `❌ Failed to initialize bot: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Start long polling for local development
   */
  private startLongPolling(): void {
    if (!this.botToken || this.isPolling) return;

    this.isPolling = true;
    this.logger.log('🔄 Starting long polling for local development...');
    void this.poll(); // Use void to explicitly ignore the promise
  }

  /**
   * Stop long polling gracefully
   */
  private stopLongPolling(): void {
    this.isPolling = false;
    if (this.pollingTimeout) {
      clearTimeout(this.pollingTimeout);
      this.pollingTimeout = null;
    }
    this.logger.log('⏹️ Long polling stopped');
  }

  /**
   * Main polling loop
   */
  private async poll(): Promise<void> {
    if (!this.isPolling) return;

    try {
      const updates = await this.getUpdates();

      for (const update of updates) {
        await this.handleUpdate(update);
        this.lastUpdateId = update.update_id + 1;
      }
    } catch (error) {
      this.logger.error(`Polling error: ${(error as Error).message}`);
    }

    // Schedule next poll
    if (this.isPolling) {
      this.pollingTimeout = setTimeout(() => {
        void this.poll();
      }, this.POLL_INTERVAL);
    }
  }

  /**
   * Get updates from Telegram API using long polling
   */
  private async getUpdates(): Promise<TelegramUpdate[]> {
    if (!this.botToken) return [];

    try {
      const response: AxiosResponse<TelegramApiResponse<TelegramUpdate[]>> =
        await axios.get(`${this.baseUrl}/getUpdates`, {
          params: {
            offset: this.lastUpdateId,
            limit: 100,
            timeout: this.POLL_TIMEOUT,
          },
          timeout: (this.POLL_TIMEOUT + 5) * 1000, // Slightly longer than Telegram timeout
        });

      return response.data.result || [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return []; // Timeout is normal for long polling
      }
      throw error;
    }
  }

  /**
   * Handle incoming update
   */
  private async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (!update.message?.text) return;

    const { message } = update;
    const chatId = message.chat.id.toString();
    const text = message.text;
    const firstName = message.from.first_name;

    this.logger.log(
      `📨 Received message from ${firstName} (${chatId}): ${text}`,
    );

    try {
      // Ensure text is not undefined before using it
      if (!text) return;
      
      switch (text.toLowerCase()) {
        case '/start':
          await this.handleStartCommand(chatId, firstName);
          break;
        case '/help':
          await this.handleHelpCommand(chatId);
          break;
        case '/myid':
          await this.handleMyIdCommand(chatId);
          break;
        case '/notifications':
        case '/status':
          await this.handleStatusCommand(chatId);
          break;
        default:
          if (text.startsWith('/')) {
            await this.handleUnknownCommand(chatId, firstName);
          }
      }
    } catch (error) {
      this.logger.error(`Error handling update: ${(error as Error).message}`);
    }
  }

  /**
   * Handle /start command
   */
  private async handleStartCommand(
    chatId: string,
    firstName: string,
  ): Promise<void> {
    const message = `🏥 <b>Selamat datang di RSUD Anugerah Bot!</b>

Halo ${firstName}! 👋

<b>Chat ID Anda:</b> <code>${chatId}</code>

<b>📋 Langkah setup notifikasi:</b>
1️⃣ Copy Chat ID di atas
2️⃣ Login ke sistem RSUD Anugerah  
3️⃣ Buka halaman Profile Anda
4️⃣ Paste Chat ID ke field "Telegram Chat ID"
5️⃣ Klik Simpan

<b>📨 Jenis notifikasi:</b>
⏰ Reminder shift kerja
🔄 Konfirmasi tukar shift  
✅ Persetujuan cuti
📋 Kegiatan harian
⚠️ Peringatan terlambat
🆕 Shift baru

<b>🤖 Perintah yang tersedia:</b>
/help - Bantuan lengkap
/myid - Dapatkan Chat ID
/status - Cek status notifikasi

Terima kasih! 😊`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(chatId: string): Promise<void> {
    const message = `ℹ️ <b>Bantuan RSUD Anugerah Bot</b>

<b>🔧 Setup Notifikasi:</b>
1. Gunakan /myid untuk mendapat Chat ID
2. Login ke sistem RSUD Anugerah
3. Masukkan Chat ID di profil Anda
4. Aktifkan notifikasi Telegram

<b>📨 Jenis notifikasi:</b>
⏰ Reminder shift
🔄 Konfirmasi tukar shift  
✅ Persetujuan cuti
📋 Kegiatan harian
⚠️ Peringatan terlambat
🆕 Shift baru

<b>🤖 Perintah:</b>
/start - Pesan selamat datang
/myid - Tampilkan Chat ID
/status - Status notifikasi
/help - Bantuan ini

<b>📞 Support:</b> IT RSUD Anugerah`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle /myid command
   */
  private async handleMyIdCommand(chatId: string): Promise<void> {
    const message = `🆔 <b>Chat ID Telegram Anda</b>

<code>${chatId}</code>

<b>📋 Langkah selanjutnya:</b>
1️⃣ Copy Chat ID di atas
2️⃣ Login ke sistem RSUD Anugerah
3️⃣ Buka halaman Profile Anda
4️⃣ Paste Chat ID ke field "Telegram Chat ID"
5️⃣ Klik Simpan

✅ Setelah disimpan, Anda akan mulai menerima notifikasi!

💡 <i>Simpan Chat ID ini dengan aman!</i>`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle /status command
   */
  private async handleStatusCommand(chatId: string): Promise<void> {
    const message = `📊 <b>Status Notifikasi</b>

<b>Chat ID:</b> <code>${chatId}</code>
<b>Status Bot:</b> ✅ Aktif
<b>Mode:</b> Long Polling (Development)
<b>Uptime:</b> ${process.uptime().toFixed(0)} detik

<b>📋 Untuk mengaktifkan notifikasi:</b>
1. Pastikan Chat ID sudah diatur di profil sistem
2. Aktifkan notifikasi Telegram di pengaturan
3. Test dengan melakukan aktivitas yang memicu notifikasi

Jika belum menerima notifikasi, hubungi IT Support.`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Handle unknown commands
   */
  private async handleUnknownCommand(
    chatId: string,
    firstName: string,
  ): Promise<void> {
    const message = `❓ Maaf ${firstName}, perintah tidak dikenali.

<b>Perintah yang tersedia:</b>
/start - Mulai menggunakan bot
/help - Bantuan lengkap
/myid - Dapatkan Chat ID
/status - Status notifikasi

Gunakan /help untuk panduan lengkap.`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Setup bot commands for better UX
   */
  async setupBotCommands(): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('Telegram bot token not configured');
      return false;
    }

    try {
      const commands: TelegramCommand[] = [
        {
          command: 'start',
          description: 'Mulai menggunakan bot RSUD Anugerah',
        },
        {
          command: 'help',
          description: 'Bantuan penggunaan bot',
        },
        {
          command: 'myid',
          description: 'Dapatkan Chat ID Telegram Anda',
        },
        {
          command: 'status',
          description: 'Status notifikasi dan bot',
        },
      ];

      const response: AxiosResponse<TelegramApiResponse<boolean>> =
        await axios.post(`${this.baseUrl}/setMyCommands`, {
          commands: commands,
        });

      if (response.data.ok) {
        this.logger.log('✅ Bot commands setup successfully');
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Error setting up bot commands: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * Send message to specific chat
   */
  private async sendMessage(chatId: string, text: string): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('Bot token not configured');
      return false;
    }

    try {
      const response: AxiosResponse<TelegramApiResponse<TelegramMessage>> =
        await axios.post(`${this.baseUrl}/sendMessage`, {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        });

      if (response.data.ok) {
        this.logger.log(`✅ Message sent to ${chatId}`);
        return true;
      } else {
        this.logger.error(
          `❌ Failed to send message: ${response.data.description}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(`Error sending message: ${(error as Error).message}`);
      return false;
    }
  }

  // Public API methods for notification service integration

  /**
   * Handle incoming webhook message (for production webhook mode)
   */
  async handleIncomingMessage(update: any): Promise<void> {
    try {
      // For webhook compatibility, just pass the update directly to handleUpdate
      await this.handleUpdate(update as TelegramUpdate);
    } catch (error) {
      this.logger.error(
        `Error handling webhook message: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Send notification to user via chat ID
   */
  async sendNotification(chatId: string, message: string): Promise<boolean> {
    return this.sendMessage(chatId, message);
  }

  /**
   * Get bot information
   */
  async getBotInfo(): Promise<TelegramBotInfo> {
    if (!this.botToken) {
      throw new Error('Telegram bot token not configured');
    }

    try {
      const response: AxiosResponse<TelegramApiResponse<TelegramBotInfo>> =
        await axios.get(`${this.baseUrl}/getMe`);
      return response.data.result;
    } catch (error) {
      this.logger.error(`Error getting bot info: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Set webhook URL (for production deployment)
   */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response: AxiosResponse<TelegramApiResponse<boolean>> =
        await axios.post(`${this.baseUrl}/setWebhook`, {
          url: webhookUrl,
        });
      return response.data.ok;
    } catch (error) {
      this.logger.error(`Error setting webhook: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Delete webhook (useful when switching from webhook to polling)
   */
  async deleteWebhook(): Promise<boolean> {
    try {
      const response: AxiosResponse<TelegramApiResponse<boolean>> =
        await axios.post(`${this.baseUrl}/deleteWebhook`);
      return response.data.ok;
    } catch (error) {
      this.logger.error(`Error deleting webhook: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Check if bot is currently polling
   */
  isCurrentlyPolling(): boolean {
    return this.isPolling;
  }

  /**
   * Get bot statistics
   */
  getBotStats(): {
    isPolling: boolean;
    lastUpdateId: number;
    uptime: number;
  } {
    return {
      isPolling: this.isPolling,
      lastUpdateId: this.lastUpdateId,
      uptime: process.uptime(),
    };
  }
}

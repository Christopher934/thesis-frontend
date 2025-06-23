import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TelegramMessage {
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown';
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string | undefined;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    this.baseUrl = `https://api.telegram.org/bot${this.botToken || 'default'}`;
    
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured. Telegram notifications will be disabled.');
    }
  }

  async sendMessage(telegramMessage: TelegramMessage): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('Telegram bot token not configured');
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: telegramMessage.chatId,
        text: telegramMessage.message,
        parse_mode: telegramMessage.parseMode || 'HTML',
      });

      if (response.data.ok) {
        this.logger.log(`Telegram message sent successfully to chat ${telegramMessage.chatId}`);
        return true;
      } else {
        this.logger.error(`Failed to send Telegram message: ${response.data.description}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error sending Telegram message: ${error.message}`);
      return false;
    }
  }

  async sendBulkMessages(messages: TelegramMessage[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const message of messages) {
      const result = await this.sendMessage(message);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
  }

  async getBotInfo(): Promise<any> {
    if (!this.botToken) {
      throw new Error('Telegram bot token not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      return response.data.result;
    } catch (error) {
      this.logger.error(`Error getting bot info: ${error.message}`);
      throw error;
    }
  }

  formatNotificationMessage(title: string, message: string, type: string): string {
    const emoji = this.getEmojiForType(type);
    return `${emoji} <b>${title}</b>\n\n${message}\n\n🏥 <i>RSUD Anugerah Hospital</i>`;
  }

  private getEmojiForType(type: string): string {
    const emojiMap = {
      REMINDER_SHIFT: '⏰',
      KONFIRMASI_TUKAR_SHIFT: '🔄',
      PERSETUJUAN_CUTI: '✅',
      KEGIATAN_HARIAN: '📋',
      PERINGATAN_TERLAMBAT: '⚠️',
      SHIFT_BARU: '🆕',
      default: '📢'
    };

    return emojiMap[type] || emojiMap.default;
  }
}

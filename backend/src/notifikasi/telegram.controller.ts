import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';

/**
 * Controller untuk menangani webhook dan API Telegram Bot
 */
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private telegramBotService: TelegramBotService) {}

  /**
   * Webhook endpoint untuk menerima updates dari Telegram
   */
  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    this.logger.log('Received Telegram webhook update');
    
    try {
      await this.telegramBotService.handleIncomingMessage(update);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Setup bot commands
   */
  @Post('setup-commands')
  async setupCommands() {
    try {
      const result = await this.telegramBotService.setupBotCommands();
      return { 
        success: result, 
        message: result ? 'Commands setup successfully' : 'Failed to setup commands' 
      };
    } catch (error) {
      this.logger.error('Error setting up commands:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get bot information
   */
  @Get('bot-info')
  async getBotInfo() {
    try {
      const info = await this.telegramBotService.getBotInfo();
      return { success: true, data: info };
    } catch (error) {
      this.logger.error('Error getting bot info:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get webhook information
   */
  @Get('webhook-info')
  async getWebhookInfo() {
    try {
      const info = await this.telegramBotService.getWebhookInfo();
      return { success: true, data: info };
    } catch (error) {
      this.logger.error('Error getting webhook info:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Set webhook URL (for production deployment)
   */
  @Post('set-webhook')
  async setWebhook(@Body() body: { url: string }) {
    try {
      const result = await this.telegramBotService.setWebhook(body.url);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error setting webhook:', error);
      return { success: false, message: error.message };
    }
  }
}

import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SimpleAutoScheduleService } from './simple-auto-schedule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('simple-auto-schedule')
@UseGuards(JwtAuthGuard)
export class SimpleAutoScheduleController {
  constructor(private simpleAutoScheduleService: SimpleAutoScheduleService) {}

  @Post('create-shifts')
  async createShifts(@Req() req: any, @Body() requests: any[]) {
    try {
      console.log('🎯 Simple Auto Schedule API called');
      return await this.simpleAutoScheduleService.createOptimalShifts(requests);
    } catch (error) {
      console.error('❌ Simple Auto Schedule API error:', error);
      throw error;
    }
  }
}

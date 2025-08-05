import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { SmartSwapService, AvailablePartner } from './smart-swap.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('smart-swap')
@UseGuards(JwtAuthGuard)
export class SmartSwapController {
  constructor(private smartSwapService: SmartSwapService) {}

  @Get('available-partners')
  async getAvailablePartners(
    @Req() req: any,
    @Query('shiftId') shiftId: string,
    @Query('targetDate') targetDate: string = new Date().toISOString().split('T')[0],
  ): Promise<AvailablePartner[]> {
    const userId = Number(req.user.sub);
    const shiftIdNum = parseInt(shiftId);
    
    if (!shiftIdNum) {
      throw new Error('Shift ID is required');
    }

    return this.smartSwapService.getAvailablePartners(
      userId,
      shiftIdNum,
      targetDate,
    );
  }

  @Get('availability-calendar')
  async getAvailabilityCalendar(
    @Req() req: any,
    @Query('month') month: string = new Date().getMonth() + 1 + '',
    @Query('year') year: string = new Date().getFullYear() + '',
  ) {
    const userId = Number(req.user.sub);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    return this.smartSwapService.getAvailabilityCalendar(
      userId,
      monthNum,
      yearNum,
    );
  }

  @Get('compatibility-score')
  async getCompatibilityScore(
    @Req() req: any,
    @Query('partnerId') partnerId: string,
    @Query('shiftId') shiftId: string,
  ) {
    const userId = Number(req.user.sub);
    
    // This could be expanded to show detailed compatibility breakdown
    const partners = await this.smartSwapService.getAvailablePartners(
      userId,
      parseInt(shiftId),
      new Date().toISOString().split('T')[0],
    );
    
    const targetPartner = partners.find(
      (p) => p.userId === parseInt(partnerId),
    );
    
    return {
      partnerId: parseInt(partnerId),
      compatibility: targetPartner?.compatibility || null,
      suggestedSwaps: targetPartner?.suggestedSwaps || [],
    };
  }
}

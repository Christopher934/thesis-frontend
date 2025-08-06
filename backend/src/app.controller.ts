import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminShiftOptimizationService } from './shift/admin-shift-optimization.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminOptimizationService: AdminShiftOptimizationService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-algorithm')
  async testAlgorithm(@Body() testData: any): Promise<any> {
    // This endpoint tests the enhanced algorithm without authentication
    try {
      console.log('🧪 Test algorithm endpoint called');
      console.log('📋 Test data received:', JSON.stringify(testData, null, 2));
      
      if (!testData?.shiftRequests || !Array.isArray(testData.shiftRequests)) {
        return {
          success: false,
          error: 'Invalid test data: shiftRequests array required',
          timestamp: new Date().toISOString(),
        };
      }

      console.log('🚀 Calling createOptimalShiftAssignments...');
      const result = await this.adminOptimizationService.createOptimalShiftAssignments(
        testData.shiftRequests,
      );
      
      console.log('✅ Algorithm test completed successfully');
      return {
        success: true,
        message: 'Enhanced algorithm test completed successfully',
        ...result,
        testMode: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('❌ Algorithm test failed:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        testMode: true,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

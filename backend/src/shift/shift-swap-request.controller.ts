import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ShiftSwapRequestService } from './shift-swap-request.service';
import { CreateShiftSwapRequestDto } from './dto/create-shift-swap-request.dto';
import { UpdateShiftSwapRequestDto } from './dto/update-shift-swap-request.dto';
import { ResponseShiftSwapRequestDto } from './dto/response-shift-swap-request.dto';
import { SwapStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user?: { id: number };
  body?: { fromUserId?: number; userId?: number };
  query?: { userId?: string };
}

@Controller('shift-swap-requests')
export class ShiftSwapRequestController {
  constructor(
    private readonly shiftSwapRequestService: ShiftSwapRequestService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDto: CreateShiftSwapRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || (req.body?.fromUserId as number); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: SwapStatus,
  ) {
    const userIdNum = userId ? parseInt(userId, 10) : undefined;
    return this.shiftSwapRequestService.findAll(userIdNum, status);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  getMyRequests(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id || parseInt(req.query?.userId as string, 10); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.getMyRequests(userId);
  }

  @Get('pending-approvals')
  @UseGuards(JwtAuthGuard)
  getPendingApprovals(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id || parseInt(req.query?.userId as string, 10); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.getPendingApprovals(userId);
  }

  @Get('admin/monitoring')
  @UseGuards(JwtAuthGuard)
  async getAdminMonitoringData(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id || parseInt(req.query?.userId as string, 10); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.getAdminMonitoringData(userId);
  }

  @Get('monitoring')
  @UseGuards(JwtAuthGuard)
  async getMonitoringData(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id || parseInt(req.query?.userId as string, 10); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.getAdminMonitoringData(userId);
  }

  @Get('monitoring/test')
  async getMonitoringDataTest(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.getAdminMonitoringData(parseInt(userId, 10));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftSwapRequestService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateShiftSwapRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || (req.body?.userId as number); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.update(id, updateDto, userId);
  }

  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard)
  respond(
    @Param('id', ParseIntPipe) id: number,
    @Body() responseDto: ResponseShiftSwapRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || (req.body?.userId as number); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.respondToRequest(
      id,
      responseDto,
      userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || (req.body?.userId as number); // Fallback for testing
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.shiftSwapRequestService.remove(id, userId);
  }
}

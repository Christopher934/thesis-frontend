import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AvailablePartner {
  userId: number;
  name: string;
  employeeId: string;
  role: string;
  currentShifts: any[];
  availability: {
    isAvailable: boolean;
    reason: string;
  };
  compatibility: {
    score: number;
    skillMatch: boolean;
    locationPreference: boolean;
    workloadBalance: number;
  };
  suggestedSwaps: any[];
}

@Injectable()
export class SmartSwapService {
  constructor(private prisma: PrismaService) {}

  async getAvailablePartners(requesterId: number, shiftId: number, targetDate: string) {
    try {
      // Get requester details
      const requester = await this.prisma.user.findUnique({
        where: { id: requesterId },
      });

      if (!requester) {
        throw new Error('Requester not found');
      }

      // Get all users except requester
      const potentialPartners = await this.prisma.user.findMany({
        where: {
          id: { not: requesterId },
          status: 'ACTIVE',
        },
        include: {
          shifts: {
            where: {
              tanggal: {
                gte: new Date(),
                lte: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });

      const availablePartners: AvailablePartner[] = [];

      for (const partner of potentialPartners) {
        // Calculate basic compatibility
        let score = 50;
        if (partner.role === requester.role) {
          score += 30;
        }

        // Count partner's shifts (workload)
        const partnerShiftCount = partner.shifts?.length || 0;
        
        availablePartners.push({
          userId: partner.id,
          name: `${partner.namaDepan} ${partner.namaBelakang}`,
          employeeId: partner.employeeId,
          role: partner.role,
          currentShifts: partner.shifts?.map((shift: any) => ({
            id: shift.id,
            date: shift.tanggal.toISOString().split('T')[0],
            startTime: shift.jammulai.toTimeString().split(' ')[0],
            endTime: shift.jamselesai.toTimeString().split(' ')[0],
            location: shift.lokasishift,
            type: shift.lokasiEnum || 'UNKNOWN'
          })) || [],
          availability: {
            isAvailable: partnerShiftCount < 20,
            reason: partnerShiftCount < 20 ? 'Available' : 'High workload',
          },
          compatibility: {
            score: Math.min(100, score),
            skillMatch: partner.role === requester.role,
            locationPreference: true,
            workloadBalance: partnerShiftCount,
          },
          suggestedSwaps: [],
        });
      }

      // Sort by compatibility score
      return availablePartners.sort((a, b) => b.compatibility.score - a.compatibility.score);
    } catch (error) {
      console.error('Error in getAvailablePartners:', error);
      return [];
    }
  }

  async getAvailabilityCalendar(userId: number, month?: number, year?: number) {
    try {
      const currentDate = new Date();
      const targetMonth = month || currentDate.getMonth() + 1;
      const targetYear = year || currentDate.getFullYear();

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);

      const calendar: any[] = [];
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const currentDateCopy = new Date(date);
        
        // Get all shifts for this date
        const shifts = await this.prisma.shift.findMany({
          where: {
            tanggal: {
              gte: currentDateCopy,
              lt: new Date(currentDateCopy.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          include: {
            user: true,
          },
        });

        calendar.push({
          date: currentDateCopy.toISOString().split('T')[0],
          day: currentDateCopy.getDate(),
          shifts: shifts.map(shift => ({
            id: shift.id,
            userId: shift.userId,
            userName: `${shift.user.namaDepan} ${shift.user.namaBelakang}`,
            employeeId: shift.user.employeeId,
            time: `${shift.jammulai.toTimeString().split(' ')[0]} - ${shift.jamselesai.toTimeString().split(' ')[0]}`,
            location: shift.lokasishift,
            type: shift.lokasiEnum,
          })),
          availability: {
            total: 100,
            busy: shifts.length,
            available: 100 - shifts.length,
            percentage: Math.round(((100 - shifts.length) / 100) * 100),
          },
        });
      }

      return calendar;
    } catch (error) {
      console.error('Error in getAvailabilityCalendar:', error);
      return [];
    }
  }
}

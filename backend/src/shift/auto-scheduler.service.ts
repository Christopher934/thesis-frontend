import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationIntegrationService } from '../notifikasi/notification-integration.service';
import { WorkloadMonitoringService } from '../services/workload-monitoring.service';
import { 
  SHIFT_TYPE_CONFIGS, 
  ShiftTypeConfig, 
  ShiftSchedule 
} from './shift-type.config';

// export interface AutoScheduleRequest {
//   userId: number;
//   startDate: string; // YYYY-MM-DD
//   endDate: string;   // YYYY-MM-DD
//   shiftType: string; // GEDUNG_ADMINISTRASI, INSTALASI_GAWAT_DARURAT, etc.
//   lokasishift: string;
//   priority?: number; // 1-5, higher = more priority
// }

// export interface AutoScheduleResult {
//   success: boolean;
//   message: string;
//   scheduledShifts: any[];
//   conflicts: any[];
// }

// @Injectable()
// export class AutoSchedulerService {
//   private readonly logger = new Logger(AutoSchedulerService.name);

//   constructor(
//     private prisma: PrismaService,
//     private notificationService: NotificationIntegrationService,
//   ) {}

//   /**
//    * Auto-schedule shifts for a user based on shift type and date range
//    */
//   async autoScheduleShifts(request: AutoScheduleRequest): Promise<AutoScheduleResult> {
//     try {
//       this.logger.log(`Starting auto-scheduling for user ${request.userId}`);

//       // Validate user exists
//       const user = await this.prisma.user.findUnique({
//         where: { id: request.userId },
//         select: {
//           id: true,
//           namaDepan: true,
//           namaBelakang: true,
//           telegramChatId: true,
//         }
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found',
//           scheduledShifts: [],
//           conflicts: [],
//         };
//       }

//       // Get shift type configuration
//       const shiftConfig = SHIFT_TYPE_CONFIGS[request.shiftType];
//       if (!shiftConfig) {
//         return {
//           success: false,
//           message: `Invalid shift type: ${request.shiftType}`,
//           scheduledShifts: [],
//           conflicts: [],
//         };
//       }

//       // Generate date range
//       const startDate = new Date(request.startDate);
//       const endDate = new Date(request.endDate);
//       const dateRange = this.generateDateRange(startDate, endDate);

//       const scheduledShifts = [];
//       const conflicts = [];

//       // Process each date
//       for (const date of dateRange) {
//         const dayOfWeek = this.getDayOfWeek(date);
        
//         // Find applicable shifts for this day
//         const applicableShifts = shiftConfig.shifts.filter(shift => 
//           shift.days.includes(dayOfWeek)
//         );

//         for (const shiftSchedule of applicableShifts) {
//           // Check for conflicts
//           const conflict = await this.checkConflicts(
//             request.userId,
//             date,
//             shiftSchedule
//           );

//           if (conflict) {
//             conflicts.push({
//               date: date.toISOString().split('T')[0],
//               shiftSchedule: shiftSchedule.name,
//               conflict: conflict.message,
//             });
//             continue;
//           }

//           // Create shift
//           const shift = await this.createAutoShift(
//             request.userId,
//             date,
//             shiftSchedule,
//             request.lokasishift,
//             request.shiftType
//           );

//           scheduledShifts.push(shift);

//           // Send notification
//           if (this.notificationService) {
//             try {
//               await this.notificationService.sendNotification(
//                 request.userId,
//                 'SHIFT_BARU_DITAMBAHKAN',
//                 '📅 Shift Otomatis Dijadwalkan',
//                 `Shift otomatis telah dijadwalkan untuk Anda pada ${date.toLocaleDateString('id-ID')} dari ${shiftSchedule.startTime} - ${shiftSchedule.endTime} di ${request.lokasishift}`,
//                 {
//                   shiftId: shift.id,
//                   autoScheduled: true,
//                   shiftType: request.shiftType,
//                 }
//               );
//             } catch (notificationError) {
//               this.logger.error('Failed to send notification:', notificationError);
//             }
//           }
//         }
//       }

//       return {
//         success: true,
//         message: `Successfully scheduled ${scheduledShifts.length} shifts`,
//         scheduledShifts,
//         conflicts,
//       };

//     } catch (error) {
//       this.logger.error('Error in auto-scheduling:', error);
//       return {
//         success: false,
//         message: error.message || 'Failed to auto-schedule shifts',
//         scheduledShifts: [],
//         conflicts: [],
//       };
//     }
//   }

//   /**
//    * Quick schedule - schedule shifts for next 7 days based on user's role
//    */
//   async quickSchedule(userId: number): Promise<AutoScheduleResult> {
//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//           id: true,
//           namaDepan: true,
//           namaBelakang: true,
//           role: true,
//           telegramChatId: true,
//         }
//       });

//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found',
//           scheduledShifts: [],
//           conflicts: [],
//         };
//       }

//       // Determine shift type based on role
//       let shiftType = 'GEDUNG_ADMINISTRASI';
//       let location = 'Gedung Administrasi';
      
//       switch (user.role) {
//         case 'PERAWAT':
//           shiftType = 'INSTALASI_RAWAT_INAP';
//           location = 'Ruang Perawatan';
//           break;
//         case 'DOKTER':
//           shiftType = 'INSTALASI_GAWAT_DARURAT';
//           location = 'IGD';
//           break;
//         case 'SUPERVISOR':
//           shiftType = 'INSTALASI_RAWAT_INAP';
//           location = 'Ruang Supervisor';
//           break;
//         default:
//           shiftType = 'GEDUNG_ADMINISTRASI';
//           location = 'Gedung Administrasi';
//       }

//       // Schedule for next 7 days
//       const today = new Date();
//       const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

//       return await this.autoScheduleShifts({
//         userId: userId,
//         startDate: today.toISOString().split('T')[0],
//         endDate: nextWeek.toISOString().split('T')[0],
//         shiftType: shiftType,
//         lokasishift: location,
//         priority: 1,
//       });

//     } catch (error) {
//       this.logger.error('Error in quick schedule:', error);
//       return {
//         success: false,
//         message: error.message || 'Failed to quick schedule',
//         scheduledShifts: [],
//         conflicts: [],
//       };
//     }
//   }

//   /**
//    * Generate date range between start and end dates
//    */
//   private generateDateRange(startDate: Date, endDate: Date): Date[] {
//     const dates = [];
//     const currentDate = new Date(startDate);
    
//     while (currentDate <= endDate) {
//       dates.push(new Date(currentDate));
//       currentDate.setDate(currentDate.getDate() + 1);
//     }
    
//     return dates;
//   }

//   /**
//    * Get day of week in required format
//    */
//   private getDayOfWeek(date: Date): string {
//     const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
//     return days[date.getDay()];
//   }

//   /**
//    * Check for scheduling conflicts
//    */
//   private async checkConflicts(userId: number, date: Date, shiftSchedule: ShiftSchedule): Promise<any> {
//     const dateStart = new Date(date);
//     dateStart.setHours(0, 0, 0, 0);
    
//     const dateEnd = new Date(date);
//     dateEnd.setHours(23, 59, 59, 999);

//     // Check if user already has a shift on this date
//     const existingShift = await this.prisma.shift.findFirst({
//       where: {
//         userId: userId,
//         tanggal: {
//           gte: dateStart,
//           lte: dateEnd,
//         },
//       },
//     });

//     if (existingShift) {
//       return {
//         message: 'User already has a shift on this date',
//         existingShift: existingShift,
//       };
//     }

//     return null;
//   }

//   /**
//    * Create auto-scheduled shift
//    */
//   private async createAutoShift(
//     userId: number,
//     date: Date,
//     shiftSchedule: ShiftSchedule,
//     location: string,
//     shiftType: string
//   ): Promise<any> {
//     const shiftDate = new Date(date);
//     shiftDate.setHours(0, 0, 0, 0);

//     // Parse start and end times
//     const [startHour, startMinute] = shiftSchedule.startTime.split(':').map(Number);
//     const [endHour, endMinute] = shiftSchedule.endTime.split(':').map(Number);

//     const startTime = new Date(shiftDate);
//     startTime.setHours(startHour, startMinute, 0, 0);

//     const endTime = new Date(shiftDate);
//     endTime.setHours(endHour, endMinute, 0, 0);

//     // Handle overnight shifts
//     if (endTime <= startTime) {
//       endTime.setDate(endTime.getDate() + 1);
//     }

//     return await this.prisma.shift.create({
//       data: {
//         tanggal: shiftDate,
//         jammulai: startTime,
//         jamselesai: endTime,
//         lokasishift: location,
//         tipeshift: shiftSchedule.name,
//         userId: userId,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             namaDepan: true,
//             namaBelakang: true,
//             telegramChatId: true,
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Get auto-schedule suggestions for a user
//    */
//   async getScheduleSuggestions(userId: number): Promise<any> {
//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//           id: true,
//           namaDepan: true,
//           namaBelakang: true,
//           role: true,
//         }
//       });

//       if (!user) {
//         return { success: false, message: 'User not found' };
//       }

//       // Get available shift types for user's role
//       const availableShiftTypes = Object.keys(SHIFT_TYPE_CONFIGS).filter(type => {
//         const config = SHIFT_TYPE_CONFIGS[type];
//         // Add role-based filtering logic here if needed
//         return true;
//       });

//       return {
//         success: true,
//         user: user,
//         availableShiftTypes: availableShiftTypes.map(type => ({
//           type: type,
//           description: SHIFT_TYPE_CONFIGS[type].description,
//           installasi: SHIFT_TYPE_CONFIGS[type].installasi,
//           shifts: SHIFT_TYPE_CONFIGS[type].shifts,
//         })),
//       };

//     } catch (error) {
//       this.logger.error('Error getting schedule suggestions:', error);
//       return { success: false, message: error.message };
//     }
//   }
// }

// //           // Create shift
// //           const shift = await this.createShift(
// //             request.userId,
// //             date,
// //             shiftSchedule,
// //             request.lokasishift,
// //             request.shiftType
// //           );

// //           scheduledShifts.push(shift);

// //           // Send notification
// //           await this.notificationService.sendShiftReminder(
// //             request.userId,
// //             shift
// //           );
// //         }
// //       }

// //       this.logger.log(`Auto-scheduling completed. Created ${scheduledShifts.length} shifts`);

// //       return {
// //         success: true,
// //         message: `Successfully scheduled ${scheduledShifts.length} shifts`,
// //         scheduledShifts,
// //         conflicts,
// //       };

// //     } catch (error) {
// //       this.logger.error(`Auto-scheduling failed: ${error.message}`);
// //       return {
// //         success: false,
// //         message: `Auto-scheduling failed: ${error.message}`,
// //         scheduledShifts: [],
// //         conflicts: [],
// //       };
// //     }
// //   }

// //   /**
// //    * Auto-schedule for multiple users (bulk scheduling)
// //    */
// //   async autoScheduleMultipleUsers(requests: AutoScheduleRequest[]): Promise<AutoScheduleResult[]> {
// //     const results = [];

// //     for (const request of requests) {
// //       const result = await this.autoScheduleShifts(request);
// //       results.push(result);
// //     }

// //     return results;
// //   }

// //   /**
// //    * Generate optimal schedule based on workload distribution
// //    */
// //   async generateOptimalSchedule(
// //     userIds: number[],
// //     startDate: string,
// //     endDate: string,
// //     shiftTypes: string[]
// //   ): Promise<AutoScheduleResult> {
// //     try {
// //       // Get user preferences and constraints
// //       const users = await this.prisma.user.findMany({
// //         where: { id: { in: userIds } },
// //         select: {
// //           id: true,
// //           namaDepan: true,
// //           namaBelakang: true,
// //           role: true,
// //         },
// //       });

// //       const scheduledShifts = [];
// //       const conflicts = [];

// //       // Distribute workload evenly
// //       const dateRange = this.generateDateRange(new Date(startDate), new Date(endDate));
// //       let userIndex = 0;

// //       for (const date of dateRange) {
// //         for (const shiftType of shiftTypes) {
// //           const shiftConfig = SHIFT_TYPE_CONFIGS[shiftType];
// //           if (!shiftConfig) continue;

// //           const dayOfWeek = this.getDayOfWeek(date);
// //           const applicableShifts = shiftConfig.shifts.filter(shift => 
// //             shift.days.includes(dayOfWeek)
// //           );

// //           for (const shiftSchedule of applicableShifts) {
// //             // Round-robin assignment
// //             const userId = userIds[userIndex % userIds.length];
// //             userIndex++;

// //             // Check conflicts
// //             const conflict = await this.checkConflicts(userId, date, shiftSchedule);
// //             if (conflict) {
// //               conflicts.push({
// //                 userId,
// //                 date: date.toISOString().split('T')[0],
// //                 shiftSchedule: shiftSchedule.name,
// //                 conflict: conflict.message,
// //               });
// //               continue;
// //             }

// //             // Create shift
// //             const shift = await this.createShift(
// //               userId,
// //               date,
// //               shiftSchedule,
// //               shiftConfig.installasi,
// //               shiftType
// //             );

// //             scheduledShifts.push(shift);
// //           }
// //         }
// //       }

// //       return {
// //         success: true,
// //         message: `Optimal schedule generated with ${scheduledShifts.length} shifts`,
// //         scheduledShifts,
// //         conflicts,
// //       };

// //     } catch (error) {
// //       this.logger.error(`Optimal scheduling failed: ${error.message}`);
// //       return {
// //         success: false,
// //         message: `Optimal scheduling failed: ${error.message}`,
// //         scheduledShifts: [],
// //         conflicts: [],
// //       };
// //     }
// //   }

// //   /**
// //    * Private helper methods
// //    */
// //   private generateDateRange(startDate: Date, endDate: Date): Date[] {
// //     const dates = [];
// //     const currentDate = new Date(startDate);

// //     while (currentDate <= endDate) {
// //       dates.push(new Date(currentDate));
// //       currentDate.setDate(currentDate.getDate() + 1);
// //     }

// //     return dates;
// //   }

// //   private getDayOfWeek(date: Date): string {
// //     const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
// //     return days[date.getDay()];
// //   }

// //   private async checkConflicts(
// //     userId: number,
// //     date: Date,
// //     shiftSchedule: ShiftSchedule
// //   ): Promise<{ message: string } | null> {
// //     const dateStart = new Date(date);
// //     dateStart.setHours(0, 0, 0, 0);
// //     const dateEnd = new Date(date);
// //     dateEnd.setHours(23, 59, 59, 999);

// //     // Check for existing shifts on the same date
// //     const existingShift = await this.prisma.shift.findFirst({
// //       where: {
// //         userId,
// //         tanggal: {
// //           gte: dateStart,
// //           lte: dateEnd,
// //         },
// //       },
// //     });

// //     if (existingShift) {
// //       return { message: 'User already has a shift on this date' };
// //     }

// //     // Add more conflict checks as needed
// //     return null;
// //   }

// //   private async createShift(
// //     userId: number,
// //     date: Date,
// //     shiftSchedule: ShiftSchedule,
// //     lokasishift: string,
// //     tipeshift: string
// //   ) {
// //     const shiftDate = new Date(date);
// //     shiftDate.setHours(0, 0, 0, 0);

// //     const [startHour, startMinute] = shiftSchedule.startTime.split(':').map(Number);
// //     const [endHour, endMinute] = shiftSchedule.endTime.split(':').map(Number);

// //     const jammulai = new Date(shiftDate);
// //     jammulai.setHours(startHour, startMinute, 0, 0);

// //     const jamselesai = new Date(shiftDate);
// //     jamselesai.setHours(endHour, endMinute, 0, 0);

// //     // Handle overnight shifts
// //     if (jamselesai <= jammulai) {
// //       jamselesai.setDate(jamselesai.getDate() + 1);
// //     }

// //     return await this.prisma.shift.create({
// //       data: {
// //         tanggal: shiftDate,
// //         jammulai,
// //         jamselesai,
// //         lokasishift,
// //         tipeshift,
// //         userId,
// //       },
// //       include: {
// //         user: {
// //           select: {
// //             id: true,
// //             namaDepan: true,
// //             namaBelakang: true,
// //             telegramChatId: true,
// //           },
// //         },
// //       },
// //     });
// //   }
// // }

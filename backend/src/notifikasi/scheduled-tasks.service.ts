import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotifikasiService } from './notifikasi.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private prisma: PrismaService,
    private notifikasiService: NotifikasiService,
  ) {}

  // Jalankan setiap 15 menit untuk cek shift yang akan dimulai dalam 1 jam
  @Cron('*/15 * * * *')
  async sendShiftReminders() {
    this.logger.log('Checking for upcoming shifts to send reminders...');
    try {
      // Get all shifts for today first, then filter by time in application logic
      const today = new Date();
      const todayStart = new Date(today.toDateString());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const allShiftsToday = await this.prisma.shift.findMany({
        where: {
          tanggal: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              telegramChatId: true,
            },
          },
        },
      });
      // Filter shifts that start within the next hour (with 15 minute tolerance)
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
      const upcomingShifts = allShiftsToday.filter(shift => {
        const shiftStart = new Date(shift.jammulai);
        const shiftTimeInMinutes = shiftStart.getHours() * 60 + shiftStart.getMinutes();
        const targetTimeInMinutes = oneHourFromNow.getHours() * 60 + oneHourFromNow.getMinutes();
        return Math.abs(shiftTimeInMinutes - targetTimeInMinutes) <= 15;
      });
      for (const shift of upcomingShifts) {
        const existingReminder = await this.prisma.notifikasi.findFirst({
          where: {
            userId: shift.userId,
            jenis: 'REMINDER_SHIFT',
            createdAt: {
              gte: todayStart,
            },
            data: {
              path: ['shiftId'],
              equals: shift.id,
            },
          },
        });
        if (!existingReminder) {
          await this.notifikasiService.createShiftReminderNotification(
            shift.userId,
            {
              id: shift.id,
              tanggal: shift.tanggal,
              jammulai: shift.jammulai,
              jamselesai: shift.jamselesai,
              lokasishift: shift.lokasishift,
            }
          );
          this.logger.log(
            `Shift reminder sent to user ${shift.user.namaDepan} ${shift.user.namaBelakang} for shift at ${shift.jammulai}`
          );
        }
      }
      this.logger.log(`Processed ${upcomingShifts.length} upcoming shifts`);
    } catch (error) {
      this.logger.error('Error sending shift reminders:', error);
    }
  }

  // Jalankan setiap hari pada jam 8 pagi untuk cek absensi terlambat
  @Cron('0 8 * * *')
  async checkLateAttendance() {
    this.logger.log('Checking for late attendance...');
    try {
      const today = new Date();
      const todayStart = new Date(today.toDateString());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const allShiftsToday = await this.prisma.shift.findMany({
        where: {
          tanggal: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              telegramChatId: true,
            },
          },
          absensi: true,
        },
      });
      const now = new Date();
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      const shiftsWithoutAttendance = allShiftsToday.filter(shift => {
        const shiftStart = new Date(shift.jammulai);
        const shiftTimeInMinutes = shiftStart.getHours() * 60 + shiftStart.getMinutes();
        return shiftTimeInMinutes < currentTimeInMinutes && (!shift.absensi || !shift.absensi.jamMasuk);
      });
      const lateShifts = shiftsWithoutAttendance;
      for (const shift of lateShifts) {
        const shiftStart = new Date(shift.jammulai);
        const shiftTimeString = `${shiftStart.getHours().toString().padStart(2, '0')}:${shiftStart.getMinutes().toString().padStart(2, '0')}`;
        const actualShiftStart = new Date(`${shift.tanggal.toDateString()} ${shiftTimeString}`);
        const now = new Date();
        const lateDuration = Math.floor((now.getTime() - actualShiftStart.getTime()) / (1000 * 60));
        if (lateDuration > 15) {
          const existingLateNotification = await this.prisma.notifikasi.findFirst({
            where: {
              userId: shift.userId,
              jenis: 'ABSENSI_TERLAMBAT',
              createdAt: {
                gte: todayStart,
              },
              data: {
                path: ['shiftId'],
                equals: shift.id,
              },
            },
          });
          if (!existingLateNotification) {
            await this.notifikasiService.createLateAttendanceNotification(
              shift.userId,
              {
                shiftId: shift.id,
                tanggal: shift.tanggal,
                jamMulaiShift: shiftTimeString,
                jamMasuk: null,
                durasiTerlambat: `${lateDuration} menit`,
              }
            );
            this.logger.log(
              `Late attendance notification sent to user ${shift.user.namaDepan} ${shift.user.namaBelakang}, late by ${lateDuration} minutes`
            );
          }
        }
      }
      this.logger.log(`Processed ${lateShifts.length} late attendance cases`);
    } catch (error) {
      this.logger.error('Error checking late attendance:', error);
    }
  }

  // Jalankan setiap hari pada jam 6 pagi untuk kirim summary aktivitas harian
  @Cron('0 6 * * *')
  async sendDailyActivitySummary() {
    this.logger.log('Sending daily activity summary...');
    try {
      const today = new Date();
      const todayStart = new Date(today.toDateString());
      const usersWithShiftsToday = await this.prisma.user.findMany({
        where: {
          shifts: {
            some: {
              tanggal: {
                gte: todayStart,
                lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          },
          telegramChatId: {
            not: null,
          },
        },
        include: {
          shifts: {
            where: {
              tanggal: {
                gte: todayStart,
                lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      });
      for (const user of usersWithShiftsToday) {
        const shifts = user.shifts;
        const shiftCount = shifts.length;
        if (shiftCount > 0) {
          const shiftTimes = shifts.map(s => {
            const startTime = new Date(s.jammulai);
            const endTime = new Date(s.jamselesai);
            const startTimeString = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
            return `${startTimeString} - ${endTimeString} (${s.lokasishift})`;
          }).join('\n');
          const pesan = `Selamat pagi! Berikut jadwal shift Anda hari ini:\n\n📅 Tanggal: ${todayStart.toLocaleDateString('id-ID')}\n🕒 Jadwal Shift (${shiftCount} shift):\n${shiftTimes}\n\nSemoga hari Anda produktif! 💪`;
          await this.notifikasiService.createNotification({
            userId: user.id,
            judul: '🌅 Summary Aktivitas Harian',
            pesan,
            jenis: 'KEGIATAN_HARIAN',
            data: {
              date: todayStart,
              shifts: shifts,
            },
            sentVia: 'TELEGRAM',
          });
          this.logger.log(`Daily summary sent to user ${user.namaDepan} ${user.namaBelakang}`);
        }
      }
      this.logger.log(`Sent daily summaries to ${usersWithShiftsToday.length} users`);
    } catch (error) {
      this.logger.error('Error sending daily activity summary:', error);
    }
  }
}

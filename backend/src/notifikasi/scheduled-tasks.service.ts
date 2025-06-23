import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
      // Ambil waktu 1 jam dari sekarang
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

      // Cari shift yang akan dimulai dalam 1 jam (dengan toleransi 15 menit)
      const upcomingShifts = await this.prisma.shift.findMany({
        where: {
          tanggal: {
            gte: new Date(new Date().toDateString()), // Hari ini
            lt: new Date(new Date(new Date().toDateString()).getTime() + 24 * 60 * 60 * 1000), // Besok
          },
          AND: [
            {
              jammulai: {
                gte: new Date(oneHourFromNow.getTime() - 15 * 60 * 1000).toTimeString().slice(0, 5), // 15 menit sebelum 1 jam
                lte: new Date(oneHourFromNow.getTime() + 15 * 60 * 1000).toTimeString().slice(0, 5), // 15 menit setelah 1 jam
              },
            },
          ],
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

      // Kirim reminder untuk setiap shift
      for (const shift of upcomingShifts) {
        // Cek apakah reminder sudah dikirim hari ini
        const existingReminder = await this.prisma.notifikasi.findFirst({
          where: {
            userId: shift.userId,
            jenis: 'REMINDER_SHIFT',
            createdAt: {
              gte: new Date(new Date().toDateString()), // Hari ini
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
  @Cron('0 8 * * *') // 8:00 AM setiap hari
  async checkLateAttendance() {
    this.logger.log('Checking for late attendance...');

    try {
      const today = new Date();
      const todayStart = new Date(today.toDateString());
      
      // Cari shift hari ini yang sudah dimulai tapi belum ada absensi masuk
      const shiftsWithoutAttendance = await this.prisma.shift.findMany({
        where: {
          tanggal: {
            gte: todayStart,
            lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          },
          jammulai: {
            lt: new Date().toTimeString().slice(0, 5), // Shift sudah dimulai
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

      // Filter shift yang belum ada absensi masuk
      const lateShifts = shiftsWithoutAttendance.filter(shift => !shift.absensi || !shift.absensi.jamMasuk);

      for (const shift of lateShifts) {
        // Hitung durasi keterlambatan
        const shiftStart = new Date(`${shift.tanggal.toDateString()} ${shift.jammulai}`);
        const now = new Date();
        const lateDuration = Math.floor((now.getTime() - shiftStart.getTime()) / (1000 * 60)); // dalam menit

        if (lateDuration > 15) { // Jika terlambat lebih dari 15 menit
          // Cek apakah notifikasi keterlambatan sudah dikirim hari ini
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
                jamMulaiShift: shift.jammulai,
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
  @Cron('0 6 * * *') // 6:00 AM setiap hari
  async sendDailyActivitySummary() {
    this.logger.log('Sending daily activity summary...');

    try {
      const today = new Date();
      const todayStart = new Date(today.toDateString());

      // Ambil semua user yang punya shift hari ini
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
            not: null, // Hanya user yang punya Telegram
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
          const shiftTimes = shifts.map(s => `${s.jammulai} - ${s.jamselesai} (${s.lokasishift})`).join('\n');
          
          const pesan = `Selamat pagi! Berikut jadwal shift Anda hari ini:

📅 Tanggal: ${todayStart.toLocaleDateString('id-ID')}
🕒 Jadwal Shift (${shiftCount} shift):
${shiftTimes}

Semoga hari Anda produktif! 💪`;

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

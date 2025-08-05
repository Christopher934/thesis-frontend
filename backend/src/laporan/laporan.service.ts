import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbsensiStatus } from '@prisma/client';
import { LaporanFilters } from './laporan.types';

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async getLaporanAbsensi(filters: LaporanFilters) {
    try {
      const whereClause: any = {};

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        whereClause.shift = {
          tanggal: {},
        };

        if (filters.startDate) {
          whereClause.shift.tanggal.gte = new Date(filters.startDate);
        }

        if (filters.endDate) {
          whereClause.shift.tanggal.lte = new Date(filters.endDate);
        }
      }

      // Filter by user
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      // Filter by status
      if (filters.status) {
        whereClause.status = filters.status as AbsensiStatus;
      }

      // Filter by location
      if (filters.lokasiShift) {
        if (!whereClause.shift) {
          whereClause.shift = {};
        }
        whereClause.shift.lokasishift = {
          contains: filters.lokasiShift,
          mode: 'insensitive',
        };
      }

      const absensi = await this.prisma.absensi.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              employeeId: true,
            },
          },
          shift: {
            select: {
              id: true,
              tanggal: true,
              jammulai: true,
              jamselesai: true,
              lokasishift: true,
              tipeshift: true,
            },
          },
        },
        orderBy: {
          shift: {
            tanggal: 'desc',
          },
        },
      });

      return absensi.map(item => ({
        id: item.id,
        nama: `${item.user.namaDepan} ${item.user.namaBelakang}`,
        employeeId: item.user.employeeId,
        tanggal: item.shift.tanggal.toLocaleDateString('id-ID'),
        jamMasuk: item.jamMasuk ? item.jamMasuk.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        jamKeluar: item.jamKeluar ? item.jamKeluar.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        jamMulaiShift: item.shift.jammulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        jamSelesaiShift: item.shift.jamselesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: item.status,
        lokasiShift: item.shift.lokasishift,
        tipeShift: item.shift.tipeshift,
        catatan: item.catatan,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil laporan absensi');
    }
  }

  async getLaporanShift(filters: LaporanFilters) {
    try {
      const whereClause: any = {};

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        whereClause.tanggal = {};

        if (filters.startDate) {
          whereClause.tanggal.gte = new Date(filters.startDate);
        }

        if (filters.endDate) {
          whereClause.tanggal.lte = new Date(filters.endDate);
        }
      }

      // Filter by user
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      // Filter by shift type
      if (filters.tipeShift) {
        whereClause.tipeshift = {
          contains: filters.tipeShift,
          mode: 'insensitive',
        };
      }

      const shifts = await this.prisma.shift.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              employeeId: true,
            },
          },
          absensi: {
            select: {
              status: true,
              jamMasuk: true,
              jamKeluar: true,
            },
          },
        },
        orderBy: {
          tanggal: 'desc',
        },
      });

      return shifts.map(item => ({
        id: item.id,
        nama: `${item.user.namaDepan} ${item.user.namaBelakang}`,
        employeeId: item.user.employeeId,
        tanggal: item.tanggal.toLocaleDateString('id-ID'),
        jammulai: item.jammulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        jamselesai: item.jamselesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        lokasishift: item.lokasishift,
        tipeshift: item.tipeshift,
        statusAbsensi: item.absensi?.status || 'ALFA',
        jamMasuk: item.absensi?.jamMasuk ? item.absensi.jamMasuk.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        jamKeluar: item.absensi?.jamKeluar ? item.absensi.jamKeluar.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
      }));
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil laporan shift');
    }
  }

  async getStatistik(filters: LaporanFilters) {
    try {
      console.log('🔍 [DEBUG] getStatistik called with filters:', filters);
      
      const whereClause: any = {};

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        whereClause.shift = {
          tanggal: {},
        };

        if (filters.startDate) {
          whereClause.shift.tanggal.gte = new Date(filters.startDate);
        }

        if (filters.endDate) {
          whereClause.shift.tanggal.lte = new Date(filters.endDate);
        }
      }

      console.log('🔍 [DEBUG] whereClause:', whereClause);

      // Get attendance statistics
      const totalAbsensi = await this.prisma.absensi.count({
        where: whereClause,
      });

      console.log('🔍 [DEBUG] totalAbsensi:', totalAbsensi);

      const hadirCount = await this.prisma.absensi.count({
        where: {
          ...whereClause,
          status: 'HADIR',
        },
      });

      const terlambatCount = await this.prisma.absensi.count({
        where: {
          ...whereClause,
          status: 'TERLAMBAT',
        },
      });

      const tidakHadirCount = await this.prisma.absensi.count({
        where: {
          ...whereClause,
          status: 'ALFA',
        },
      });

      console.log('🔍 [DEBUG] attendance counts:', { hadirCount, terlambatCount, tidakHadirCount });

      // Get shift statistics
      const totalShift = await this.prisma.shift.count({
        where: filters.startDate || filters.endDate ? {
          tanggal: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          },
        } : {},
      });

      console.log('🔍 [DEBUG] totalShift:', totalShift);

      // Get user statistics
      const totalUsers = await this.prisma.user.count({
        where: {
          status: 'ACTIVE',
        },
      });

      console.log('🔍 [DEBUG] totalUsers:', totalUsers);

      // Get location statistics
      const locationStats = await this.prisma.shift.groupBy({
        by: ['lokasishift'],
        _count: {
          id: true,
        },
        where: filters.startDate || filters.endDate ? {
          tanggal: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          },
        } : {},
      });

      console.log('🔍 [DEBUG] locationStats:', locationStats);

      // Get shift type statistics
      const shiftTypeStats = await this.prisma.shift.groupBy({
        by: ['tipeshift'],
        _count: {
          id: true,
        },
        where: filters.startDate || filters.endDate ? {
          tanggal: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          },
        } : {},
      });

      console.log('🔍 [DEBUG] shiftTypeStats:', shiftTypeStats);

      const result = {
        absensi: {
          total: totalAbsensi,
          hadir: hadirCount,
          terlambat: terlambatCount,
          tidakHadir: tidakHadirCount,
          persentaseHadir: totalAbsensi > 0 ? ((hadirCount / totalAbsensi) * 100).toFixed(1) : '0',
          persentaseTerlambat: totalAbsensi > 0 ? ((terlambatCount / totalAbsensi) * 100).toFixed(1) : '0',
          persentaseTidakHadir: totalAbsensi > 0 ? ((tidakHadirCount / totalAbsensi) * 100).toFixed(1) : '0',
        },
        shift: {
          total: totalShift,
        },
        user: {
          total: totalUsers,
        },
        lokasi: locationStats.map(item => ({
          nama: item.lokasishift,
          jumlah: item._count.id,
        })),
        tipeShift: shiftTypeStats.map(item => ({
          nama: item.tipeshift,
          jumlah: item._count.id,
        })),
      };

      console.log('🔍 [DEBUG] Final result:', result);

      return result;
    } catch (error) {
      console.error('🔥 [ERROR] getStatistik error:', error);
      throw new InternalServerErrorException('Gagal mengambil statistik');
    }
  }

  async getRingkasan(filters: LaporanFilters) {
    try {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

      // Get daily attendance summary
      const dailyAttendance = await this.prisma.absensi.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        where: {
          shift: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      });

      // Get top performing employees
      const topEmployees = await this.prisma.absensi.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        where: {
          status: 'HADIR',
          shift: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      // Get user details for top employees
      const topEmployeesWithDetails = await Promise.all(
        topEmployees.map(async (emp) => {
          const user = await this.prisma.user.findUnique({
            where: { id: emp.userId },
            select: {
              namaDepan: true,
              namaBelakang: true,
              employeeId: true,
            },
          });
          return {
            nama: `${user?.namaDepan} ${user?.namaBelakang}`,
            employeeId: user?.employeeId,
            jumlahHadir: emp._count.id,
          };
        })
      );

      // Get recent activities
      const recentActivities = await this.prisma.absensi.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              namaDepan: true,
              namaBelakang: true,
            },
          },
          shift: {
            select: {
              tanggal: true,
              lokasishift: true,
            },
          },
        },
        where: {
          shift: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      });

      return {
        periode: {
          start: startDate.toLocaleDateString('id-ID'),
          end: endDate.toLocaleDateString('id-ID'),
        },
        ringkasanHarian: dailyAttendance.map(item => ({
          status: item.status,
          jumlah: item._count.id,
        })),
        pegawaiTerbaik: topEmployeesWithDetails,
        aktivitasTerbaru: recentActivities.map(item => ({
          nama: `${item.user.namaDepan} ${item.user.namaBelakang}`,
          tanggal: item.shift.tanggal.toLocaleDateString('id-ID'),
          lokasi: item.shift.lokasishift,
          status: item.status,
          waktu: item.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        })),
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil ringkasan');
    }
  }

  async exportPDF(type: 'absensi' | 'shift' | 'statistik', filters: LaporanFilters) {
    try {
      // TODO: Implement PDF export functionality
      // For now, return a placeholder response
      return {
        message: 'PDF export will be implemented',
        type,
        filters,
        downloadUrl: '/api/laporan/download/pdf',
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal export PDF');
    }
  }

  async exportExcel(type: 'absensi' | 'shift' | 'statistik', filters: LaporanFilters) {
    try {
      // TODO: Implement Excel export functionality
      // For now, return a placeholder response
      return {
        message: 'Excel export will be implemented',
        type,
        filters,
        downloadUrl: '/api/laporan/download/excel',
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal export Excel');
    }
  }
}

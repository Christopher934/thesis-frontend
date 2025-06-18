import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto) {
    try {
      // Parse the date string to a Date object
      const tanggalDate = new Date(createShiftDto.tanggal);

      // Check if the user exists before creating the shift
      let userId: number | undefined = createShiftDto.userId;

      // If no userId is provided, try to find the user by idpegawai
      if (!userId && createShiftDto.idpegawai) {
        const user = await this.prisma.user.findFirst({
          where: { username: createShiftDto.idpegawai },
        });

        if (user) {
          userId = user.id;
        } else {
          throw new Error(
            'Cannot create shift: User with provided ID does not exist',
          );
        }
      } else if (userId) {
        // Verify the user exists
        const userExists = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!userExists) {
          throw new Error(
            'Cannot create shift: User with provided ID does not exist',
          );
        }
      } else {
        throw new Error('Cannot create shift: No user ID or username provided');
      }

      // Create a new shift in the database
      const shift = await this.prisma.shift.create({
        data: {
          tanggal: tanggalDate,
          jammulai: createShiftDto.jammulai,
          jamselesai: createShiftDto.jamselesai,
          lokasishift: createShiftDto.lokasishift,
          // Try to map string lokasi to enum if possible
          lokasiEnum: createShiftDto.lokasiEnum || undefined,
          tipeshift: createShiftDto.tipeshift,
          // Try to map string tipe to enum if possible
          tipeEnum: createShiftDto.tipeEnum || undefined,
          idpegawai: createShiftDto.idpegawai,
          userId: userId, // Use the validated userId
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
            },
          },
        },
      });

      // Format the response
      return {
        ...shift,
        tanggal: shift.tanggal.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        nama: shift.user
          ? `${shift.user.namaDepan} ${shift.user.namaBelakang}`
          : undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      // Get all shifts with user information
      const shifts = await this.prisma.shift.findMany({
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
            },
          },
        },
      });

      // Jika ada data shift dari database, return itu
      if (shifts && shifts.length > 0) {
        // Map the shifts to include the user's full name
        return shifts.map((shift) => ({
          ...shift,
          nama: shift.user
            ? `${shift.user.namaDepan} ${shift.user.namaBelakang}`
            : undefined,
        }));
      }

      // Jika tidak ada data, return mock data
      console.log('No shifts found in database, returning mock data');
      return this.getMockShifts();
    } catch (error) {
      console.error('Error fetching shifts:', error);
      // Return mock data jika terjadi error
      return this.getMockShifts();
    }
  }

  // Helper method untuk menghasilkan data shift dummy
  private getMockShifts() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Generate shifts for current month (10 shifts)
    return [
      {
        id: 1,
        tanggal: new Date(year, month, 5),
        jammulai: '07:00',
        jamselesai: '15:00',
        lokasishift: 'POLI_UMUM',
        tipeshift: 'PAGI',
        idpegawai: 'DOK001',
        userId: 2,
        nama: 'Dokter Spesialis',
      },
      {
        id: 2,
        tanggal: new Date(year, month, 5),
        jammulai: '15:00',
        jamselesai: '23:00',
        lokasishift: 'POLI_UMUM',
        tipeshift: 'SIANG',
        idpegawai: 'PER001',
        userId: 3,
        nama: 'Perawat Senior',
      },
      {
        id: 3,
        tanggal: new Date(year, month, 6),
        jammulai: '07:00',
        jamselesai: '15:00',
        lokasishift: 'IGD',
        tipeshift: 'PAGI',
        idpegawai: 'DOK001',
        userId: 2,
        nama: 'Dokter Spesialis',
      },
      {
        id: 4,
        tanggal: new Date(year, month, 6),
        jammulai: '15:00',
        jamselesai: '23:00',
        lokasishift: 'IGD',
        tipeshift: 'SIANG',
        idpegawai: 'PER001',
        userId: 3,
        nama: 'Perawat Senior',
      },
      {
        id: 5,
        tanggal: new Date(year, month, 7),
        jammulai: '07:00',
        jamselesai: '15:00',
        lokasishift: 'POLI_ANAK',
        tipeshift: 'PAGI',
        idpegawai: 'DOK001',
        userId: 2,
        nama: 'Dokter Spesialis',
      },
      {
        id: 6,
        tanggal: new Date(year, month, 7),
        jammulai: '15:00',
        jamselesai: '23:00',
        lokasishift: 'POLI_ANAK',
        tipeshift: 'SIANG',
        idpegawai: 'PER001',
        userId: 3,
        nama: 'Perawat Senior',
      },
      {
        id: 7,
        tanggal: new Date(year, month, 8),
        jammulai: '07:00',
        jamselesai: '15:00',
        lokasishift: 'RUANG_OPERASI',
        tipeshift: 'PAGI',
        idpegawai: 'DOK001',
        userId: 2,
        nama: 'Dokter Spesialis',
      },
      {
        id: 8,
        tanggal: new Date(year, month, 8),
        jammulai: '15:00',
        jamselesai: '23:00',
        lokasishift: 'RUANG_OPERASI',
        tipeshift: 'SIANG',
        idpegawai: 'PER001',
        userId: 3,
        nama: 'Perawat Senior',
      },
      {
        id: 9,
        tanggal: new Date(year, month, 9),
        jammulai: '07:00',
        jamselesai: '15:00',
        lokasishift: 'POLI_GIGI',
        tipeshift: 'PAGI',
        idpegawai: 'DOK001',
        userId: 2,
        nama: 'Dokter Spesialis',
      },
      {
        id: 10,
        tanggal: new Date(year, month, 9),
        jammulai: '15:00',
        jamselesai: '23:00',
        lokasishift: 'POLI_GIGI',
        tipeshift: 'SIANG',
        idpegawai: 'PER001',
        userId: 3,
        nama: 'Perawat Senior',
      },
    ];
  }

  async findOne(id: number) {
    try {
      const shift = await this.prisma.shift.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
            },
          },
        },
      });

      if (!shift) {
        throw new NotFoundException(`Shift with ID ${id} not found`);
      }

      return {
        ...shift,
        nama: shift.user
          ? `${shift.user.namaDepan} ${shift.user.namaBelakang}`
          : undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateShiftDto: UpdateShiftDto) {
    try {
      // Check if the shift exists
      const existingShift = await this.prisma.shift.findUnique({
        where: { id },
      });

      if (!existingShift) {
        throw new NotFoundException(`Shift with ID ${id} not found`);
      }

      // Validate user if userId or idpegawai is being updated
      let validatedUserId = existingShift.userId;

      if (updateShiftDto.userId) {
        // If userId is provided, validate it exists
        const userExists = await this.prisma.user.findUnique({
          where: { id: updateShiftDto.userId },
        });

        if (!userExists) {
          throw new Error(
            'Cannot update shift: User with provided ID does not exist',
          );
        }

        validatedUserId = updateShiftDto.userId;
      } else if (
        updateShiftDto.idpegawai &&
        updateShiftDto.idpegawai !== existingShift.idpegawai
      ) {
        // If idpegawai is provided and different from existing, find the corresponding user
        const user = await this.prisma.user.findFirst({
          where: { username: updateShiftDto.idpegawai },
        });

        if (!user) {
          throw new Error(
            'Cannot update shift: User with provided username does not exist',
          );
        }

        validatedUserId = user.id;
      }

      // Prepare tanggal data - handle possible undefined
      const tanggalData = updateShiftDto.tanggal
        ? new Date(updateShiftDto.tanggal)
        : undefined;

      // Update the shift
      const shift = await this.prisma.shift.update({
        where: { id },
        data: {
          tanggal: tanggalData,
          jammulai: updateShiftDto.jammulai,
          jamselesai: updateShiftDto.jamselesai,
          lokasishift: updateShiftDto.lokasishift,
          // Update the enum field if provided
          lokasiEnum: updateShiftDto.lokasiEnum,
          tipeshift: updateShiftDto.tipeshift,
          // Update the enum field if provided
          tipeEnum: updateShiftDto.tipeEnum,
          idpegawai: updateShiftDto.idpegawai,
          userId: validatedUserId,
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
            },
          },
        },
      });

      return {
        ...shift,
        nama: shift.user
          ? `${shift.user.namaDepan} ${shift.user.namaBelakang}`
          : undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Check if the shift exists
      const shift = await this.prisma.shift.findUnique({
        where: { id },
      });

      if (!shift) {
        throw new NotFoundException(`Shift with ID ${id} not found`);
      }

      // Delete the shift
      await this.prisma.shift.delete({
        where: { id },
      });

      return { message: `Shift with ID ${id} has been deleted` };
    } catch (error) {
      throw error;
    }
  }
}

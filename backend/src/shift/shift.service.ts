import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationIntegrationService } from '../notifikasi/notification-integration.service';
import { ShiftValidationService } from '../services/shift-validation.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { 
  getShiftTypeConfig, 
  getAllShiftTypes, 
  getShiftScheduleForDay, 
  validateShiftTime,
  getScheduleForDate,
  getShiftOptionsForDate
} from './shift-type.config';

@Injectable()
export class ShiftService {
  constructor(
    private prisma: PrismaService,
    private notificationService?: NotificationIntegrationService,
    private validationService?: ShiftValidationService,
  ) {}

  async create(createShiftDto: CreateShiftDto) {
    if (!createShiftDto) {
      throw new BadRequestException('Shift data is required');
    }
    try {
      // Parse the date string to a Date object
      const tanggalDate = new Date(createShiftDto.tanggal);

      // Check if the user exists before creating the shift
      let userId: number | undefined = createShiftDto.userId;

      // If no userId is provided, try to find the user by idpegawai (username for now)
      if (!userId && createShiftDto.idpegawai) {
        const user = await this.prisma.user.findFirst({
          where: { username: createShiftDto.idpegawai },
        });

        if (user) {
          userId = user.id;
        } else {
          throw new Error(
            'Cannot create shift: User with provided employee ID does not exist',
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
        throw new Error('Cannot create shift: No user ID or employee ID provided');
      }

      // Create DateTime objects for time fields
      const parseTimeToDate = (timeString: string, baseDate: Date): Date => {
        const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
        const dateTime = new Date(baseDate);
        dateTime.setHours(hours, minutes || 0, 0, 0);
        return dateTime;
      };

      const jammulaiDate = parseTimeToDate(createShiftDto.jammulai, tanggalDate);
      const jamselesaiDate = parseTimeToDate(createShiftDto.jamselesai, tanggalDate);

      // Handle overnight shifts (end time before start time)
      if (jamselesaiDate <= jammulaiDate) {
        jamselesaiDate.setDate(jamselesaiDate.getDate() + 1);
      }

      // Validate shift assignment before creating
      if (this.validationService) {
        const validation = await this.validationService.validateShiftAssignment(
          userId,
          tanggalDate,
          (createShiftDto.tipeEnum || createShiftDto.tipeshift) as any,
          createShiftDto.lokasishift,
        );

        // Check for high severity conflicts (workload exceeded)
        const highSeverityConflicts = validation.conflicts.filter(
          (c) => c.severity === 'HIGH',
        );
        if (highSeverityConflicts.length > 0) {
          const workloadConflicts = highSeverityConflicts.filter(
            (c) => c.type === 'WORKLOAD_EXCEEDED',
          );
          if (workloadConflicts.length > 0) {
            throw new BadRequestException({
              message: 'Tidak dapat membuat jadwal - beban kerja berlebihan',
              details: workloadConflicts[0].message,
              type: 'WORKLOAD_EXCEEDED',
              requiresOverworkRequest: true,
            });
          }
          
          // Other high severity conflicts
          throw new BadRequestException({
            message: 'Tidak dapat membuat jadwal - terdapat konflik',
            details: highSeverityConflicts.map((c) => c.message).join('; '),
            conflicts: highSeverityConflicts,
          });
        }
      }

      // Create a new shift in the database
      const shift = await this.prisma.shift.create({
        data: {
          tanggal: tanggalDate,
          jammulai: jammulaiDate,
          jamselesai: jamselesaiDate,
          lokasishift: createShiftDto.lokasishift,
          // Try to map string lokasi to enum if possible
          lokasiEnum: createShiftDto.lokasiEnum || undefined,
          tipeshift: createShiftDto.tipeshift,
          // Try to map string tipe to enum if possible
          tipeEnum: createShiftDto.tipeEnum || undefined,
          userId: userId, // Use the validated userId
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
              employeeId: true,
            },
          },
        },
      });

      // Format the response first (before notification)
      const formattedShift = {
        ...shift,
        tanggal: shift.tanggal.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        nama: shift.user
          ? `${shift.user.namaDepan} ${shift.user.namaBelakang}`
          : undefined,
        idpegawai: shift.user?.username, // Include for compatibility
        notificationStatus: 'pending' // Track notification status
      };

      // Kirim notifikasi shift baru (async, non-blocking)
      if (this.notificationService && shift.user) {
        // Send notification in background without blocking the response
        setImmediate(() => {
          // Run async function without awaiting - explicitly void to handle promise
          void (async () => {
            try {
              if (this.notificationService) {
                await this.notificationService.sendNotification(
                  shift.userId,
                  'SHIFT_BARU_DITAMBAHKAN',
                  '📅 Shift Baru Ditambahkan',
                  `Shift baru telah ditambahkan untuk Anda pada ${shift.tanggal.toLocaleDateString('id-ID')} dari ${shift.jammulai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${shift.jamselesai.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} di ${shift.lokasishift}`,
                  {
                    shiftId: shift.id,
                    tanggal: shift.tanggal,
                    jammulai: shift.jammulai,
                    jamselesai: shift.jamselesai,
                    lokasishift: shift.lokasishift,
                    tipeshift: shift.tipeshift,
                  },
                );
                console.log(
                  `[ShiftService][create] Notification sent successfully for shift ${shift.id}`,
                );
              }
            } catch (notificationError) {
              console.error(
                `[ShiftService][create] Notification failed for shift ${shift.id}:`,
                notificationError,
              );
              // Log but don't affect shift creation success
            }
          })();
        });
        
        // Mark notification as sent (optimistic)
        formattedShift.notificationStatus = 'sent';
      } else {
        formattedShift.notificationStatus = 'skipped';
      }

      // Return formatted shift with success confirmation
      return {
        success: true,
        message: 'Shift berhasil dibuat',
        data: formattedShift,
      };
    } catch (error) {
      console.error('[ShiftService][create] Error:', error);
      
      // Return structured error for better frontend handling
      if (error instanceof BadRequestException) {
        throw error; // Re-throw validation errors as-is
      }
      
      throw new InternalServerErrorException({
        success: false,
        message: (error as Error).message || 'Failed to create shift',
        error: (error as Error).message,
      });
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
              employeeId: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
            },
          },
        },
      });

      // Jika ada data shift dari database, return itu
      if (shifts && shifts.length > 0) {
        // Map the shifts to include the user's full name and idpegawai for frontend compatibility
        return shifts.map((shift) => {
          // Format time fields from DateTime to HH:MM string
          const formatTime = (timeValue: Date): string => {
            if (!timeValue) return '';
            const hours = timeValue.getHours().toString().padStart(2, '0');
            const minutes = timeValue.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          };

          return {
            ...shift,
            nama: shift.user
              ? `${shift.user.namaDepan} ${shift.user.namaBelakang}`
              : undefined,
            // Add idpegawai at top level for frontend compatibility
            idpegawai: shift.user?.username || shift.user?.employeeId || undefined,
            // Format tanggal as YYYY-MM-DD
            tanggal: shift.tanggal.toISOString().split('T')[0],
            // Format time fields properly
            jammulai: formatTime(shift.jammulai),
            jamselesai: formatTime(shift.jamselesai),
          };
        });
      }

      // Return empty array if no data found
      return [];
    } catch (error) {
      console.error('[ShiftService][findAll] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to get shifts');
    }
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('Shift id is required');
    }
    try {
      const shift = await this.prisma.shift.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              employeeId: true,
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
      console.error('[ShiftService][findOne] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to get shift');
    }
  }

  async update(id: number, updateShiftDto: UpdateShiftDto) {
    if (!id || !updateShiftDto) {
      throw new BadRequestException('Shift id and update data are required');
    }
    try {
      // Check if the shift exists
      const existingShift = await this.prisma.shift.findUnique({
        where: { id },
      });

      if (!existingShift) {
        throw new NotFoundException(`Shift with ID ${id} not found`);
      }

      // Validate user if userId or employeeId is being updated
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
      } else if (updateShiftDto.idpegawai) {
        // If idpegawai is provided, find the corresponding user by username for now
        const user = await this.prisma.user.findFirst({
          where: { username: updateShiftDto.idpegawai },
        });

        if (!user) {
          throw new Error(
            'Cannot update shift: User with provided employee ID does not exist',
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
          userId: validatedUserId,
        },
        include: {
          user: {
            select: {
              id: true,
              namaDepan: true,
              namaBelakang: true,
              username: true,
              employeeId: true,
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
      console.error('[ShiftService][update] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to update shift');
    }
  }

  async remove(id: number) {
    if (!id) {
      throw new BadRequestException('Shift id is required');
    }
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
      console.error('[ShiftService][remove] Error:', error);
      throw new InternalServerErrorException(error.message || 'Failed to delete shift');
    }
  }

  /**
   * Get all available shift types based on RSUD Anugerah official regulations
   */
  async getShiftTypes() {
    try {
      const shiftTypes = getAllShiftTypes();
      return shiftTypes.map(type => ({
        type: type.type,
        description: type.description,
        installasi: type.installasi,
        hasRotatingBreaks: type.hasRotatingBreaks,
        notes: type.notes,
        shiftsCount: type.shifts.length
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shift schedules for a specific shift type
   */
  async getShiftTypeSchedules(shiftType: string) {
    try {
      const config = getShiftTypeConfig(shiftType);
      if (!config) {
        throw new NotFoundException(`Shift type ${shiftType} not found`);
      }

      return {
        type: config.type,
        description: config.description,
        installasi: config.installasi,
        hasRotatingBreaks: config.hasRotatingBreaks,
        notes: config.notes,
        shifts: config.shifts
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available shift options for a specific date and shift type
   */
  async getShiftOptionsForDate(shiftType: string, date: string) {
    try {
      const targetDate = new Date(date);
      const options = getShiftOptionsForDate(shiftType, targetDate);
      
      if (options.length === 0) {
        return {
          date: date,
          shiftType: shiftType,
          message: 'No shifts available for this date and shift type',
          options: []
        };
      }

      return {
        date: date,
        shiftType: shiftType,
        options: options.map(option => ({
          name: option.name,
          jammulai: option.startTime,
          jamselesai: option.endTime,
          breakTime: option.breakTime
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate if a shift time is valid for the given shift type and date
   */
  async validateShiftForDate(shiftType: string, date: string, jammulai: string, jamselesai: string) {
    try {
      const targetDate = new Date(date);
      const isValid = validateShiftTime(shiftType, jammulai, jamselesai, targetDate);
      
      return {
        valid: isValid,
        shiftType: shiftType,
        date: date,
        jammulai: jammulai,
        jamselesai: jamselesai,
        message: isValid 
          ? 'Shift time is valid for this shift type and date'
          : 'Shift time is not valid for this shift type and date'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create shift using official RSUD shift type system
   */
  async createWithShiftType(createShiftDto: CreateShiftDto & { shiftType: string; shiftOption: string }) {
    try {
      // Validate the shift type and get available options
      const targetDate = new Date(createShiftDto.tanggal);
      const shiftOptions = getShiftOptionsForDate(createShiftDto.shiftType, targetDate);
      
      // Find the selected shift option
      const selectedOption = shiftOptions.find(option => option.name === createShiftDto.shiftOption);
      if (!selectedOption) {
        throw new NotFoundException(`Shift option "${createShiftDto.shiftOption}" not available for ${createShiftDto.shiftType} on ${createShiftDto.tanggal}`);
      }

      // Create the shift with the validated times
      const shiftData = {
        ...createShiftDto,
        jammulai: selectedOption.startTime,
        jamselesai: selectedOption.endTime,
        shiftType: createShiftDto.shiftType as any
      };

      return await this.create(shiftData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shifts by installation type
   */
  async getShiftsByInstallation(installasi: string, startDate?: string, endDate?: string) {
    try {
      // Map common installation names to enum values
      const lokasiMapping: { [key: string]: string } = {
        'IGD': 'GAWAT_DARURAT',
        'GAWAT_DARURAT': 'GAWAT_DARURAT',
        'RAWAT_JALAN': 'RAWAT_JALAN',
        'RAWAT_INAP': 'RAWAT_INAP',
        'LABORATORIUM': 'LABORATORIUM',
        'FARMASI': 'FARMASI',
        'RADIOLOGI': 'RADIOLOGI',
        'GIZI': 'GIZI',
        'KEAMANAN': 'KEAMANAN',
        'LAUNDRY': 'LAUNDRY',
        'CLEANING_SERVICE': 'CLEANING_SERVICE',
        'SUPIR': 'SUPIR'
      };

      const whereClause: any = {
        OR: [
          { lokasishift: { contains: installasi, mode: 'insensitive' } }
        ]
      };

      // Add enum condition if mapping exists
      const enumValue = lokasiMapping[installasi.toUpperCase()];
      if (enumValue) {
        whereClause.OR.push({ lokasiEnum: enumValue });
      }

      if (startDate && endDate) {
        whereClause.tanggal = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const shifts = await this.prisma.shift.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              employeeId: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
        },
        orderBy: [
          { tanggal: 'asc' },
          { jammulai: 'asc' }
        ]
      });

      return shifts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get historical shifts data for a specific year and month
   */
  async getHistoricalShifts(year: number, month: number) {
    try {
      // Create start and end dates for the month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed
      const endDate = new Date(year, month, 0); // last day of the month

      const shifts = await this.prisma.shift.findMany({
        where: {
          tanggal: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: {
              id: true,
              employeeId: true,
              namaDepan: true,
              namaBelakang: true,
              role: true,
            },
          },
        },
        orderBy: [
          { tanggal: 'asc' },
          { jammulai: 'asc' }
        ]
      });

      // Format the data for frontend
      const formattedShifts = shifts.map(shift => ({
        id: shift.id,
        idpegawai: shift.user?.employeeId || shift.userId.toString(),
        nama: shift.user ? `${shift.user.namaDepan} ${shift.user.namaBelakang}` : `User ${shift.userId}`,
        tanggal: shift.tanggal,
        jammulai: shift.jammulai,
        jamselesai: shift.jamselesai,
        lokasishift: shift.lokasishift,
        tipeshift: shift.tipeshift || shift.tipeEnum,
        userId: shift.userId,
        user: shift.user
      }));

      return formattedShifts;
    } catch (error) {
      console.error('Error fetching historical shifts:', error);
      throw new InternalServerErrorException(
        `Failed to fetch historical shifts: ${error.message}`
      );
    }
  }

  async removeAll() {
    try {
      // Count total shifts before deletion for response
      const countResult = await this.prisma.shift.count();
      
      // Delete all shifts
      const result = await this.prisma.shift.deleteMany({});
      
      return {
        success: true,
        message: 'All shifts have been successfully deleted',
        deletedCount: result.count,
        totalBefore: countResult
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete all shifts: ${error.message}`
      );
    }
  }
}

// Simplified user service with minimal compilation issues
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, Gender, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async countByRole(): Promise<Record<string, number>> {
    try {
      const roles: Role[] = ['ADMIN', 'DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR'];
      const result: Record<string, number> = {};
      
      for (const role of roles) {
        const cnt = await this.prisma.user.count({
          where: { role },
        });
        result[role] = cnt;
      }
      
      return result;
    } catch (error) {
      console.error('Error counting by role:', error);
      return {};
    }
  }

  async countByGender(): Promise<{ L: number; P: number }> {
    try {
      const countL = await this.prisma.user.count({
        where: { jenisKelamin: 'L' },
      });
      const countP = await this.prisma.user.count({
        where: { jenisKelamin: 'P' },
      });
      return { L: countL, P: countP };
    } catch (error) {
      console.error('Error counting by gender:', error);
      return { L: 0, P: 0 };
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          employeeId: true,
          username: true,
          email: true,
          namaDepan: true,
          namaBelakang: true,
          alamat: true,
          noHp: true,
          tanggalLahir: true,
          jenisKelamin: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          username: true,
          email: true,
          namaDepan: true,
          namaBelakang: true,
          alamat: true,
          noHp: true,
          tanggalLahir: true,
          jenisKelamin: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding user:', error);
      throw new BadRequestException('Error retrieving user');
    }
  }

  async create(data: any) {
    try {
      // Hash password
      const hashed = await bcrypt.hash(data.password || 'password123', 10);
      
      // Parse date
      let tanggal: Date | undefined;
      if (data.tanggalLahir) {
        tanggal = new Date(data.tanggalLahir);
      }

      // Check for existing user
      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: data.username },
            { email: data.email },
            { employeeId: data.employeeId },
          ],
        },
      });

      if (existing) {
        throw new BadRequestException('User with this username, email, or employee ID already exists');
      }

      // Create user with proper enum types
      const createdUser = await this.prisma.user.create({
        data: {
          employeeId: data.employeeId || '',
          username: data.username || '',
          email: data.email || '',
          password: hashed,
          namaDepan: data.namaDepan || '',
          namaBelakang: data.namaBelakang || '',
          alamat: data.alamat || null,
          noHp: data.noHp || '',
          jenisKelamin: (data.jenisKelamin || 'L') as Gender,
          tanggalLahir: tanggal || new Date('1970-01-01'),
          role: (data.role || 'STAF') as Role,
          status: (data.status || 'ACTIVE') as UserStatus,
        },
        select: {
          id: true,
          username: true,
          email: true,
          employeeId: true,
          namaDepan: true,
          namaBelakang: true,
          alamat: true,
          noHp: true,
          tanggalLahir: true,
          jenisKelamin: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return createdUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new BadRequestException('Error creating user');
    }
  }

  async update(id: number, data: any) {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Prepare update data
      const updateData: any = {};
      
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }
      
      if (data.namaDepan !== undefined) updateData.namaDepan = data.namaDepan;
      if (data.namaBelakang !== undefined) updateData.namaBelakang = data.namaBelakang;
      if (data.alamat !== undefined) updateData.alamat = data.alamat;
      if (data.noHp !== undefined) updateData.noHp = data.noHp;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.jenisKelamin !== undefined) updateData.jenisKelamin = data.jenisKelamin as Gender;
      if (data.role !== undefined) updateData.role = data.role as Role;
      if (data.status !== undefined) updateData.status = data.status as UserStatus;
      
      if (data.tanggalLahir) {
        updateData.tanggalLahir = new Date(data.tanggalLahir);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          employeeId: true,
          namaDepan: true,
          namaBelakang: true,
          alamat: true,
          noHp: true,
          tanggalLahir: true,
          jenisKelamin: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new BadRequestException('Error updating user');
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const removed = await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          employeeId: true,
          namaDepan: true,
          namaBelakang: true,
        },
      });

      return removed;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing user:', error);
      throw new BadRequestException('Error removing user');
    }
  }

  async generateEmployeeIds() {
    try {
      const existingUsers = await this.prisma.user.findMany({
        where: { 
          employeeId: { equals: "" } // Find users with empty string instead of null
        },
        select: { id: true, role: true },
      });

      for (const user of existingUsers) {
        let prefix = 'USR';
        switch (user.role) {
          case 'ADMIN': prefix = 'ADM'; break;
          case 'DOKTER': prefix = 'DOK'; break;
          case 'PERAWAT': prefix = 'PRW'; break;
          case 'STAF': prefix = 'STF'; break;
          case 'SUPERVISOR': prefix = 'SPV'; break;
        }
        
        const employeeId = `${prefix}${user.id.toString().padStart(3, '0')}`;
        
        await this.prisma.user.update({
          where: { id: user.id },
          data: { employeeId },
        });
      }

      return { message: 'Employee IDs generated successfully' };
    } catch (error) {
      console.error('Error generating employee IDs:', error);
      throw new BadRequestException('Error generating employee IDs');
    }
  }
}

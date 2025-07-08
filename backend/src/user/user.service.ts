/* eslint-disable prettier/prettier */
// src/user/user.service.ts
// eslint-disable-next-line prettier/prettier
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async countByRole(): Promise<Record<string, number>> {
    // Enum Role di Prisma: ADMIN, DOKTER, PERAWAT, STAF, SUPERVISOR
    const roles: Role[] = ['ADMIN', 'DOKTER', 'PERAWAT', 'STAF', 'SUPERVISOR'];

    const result: Record<string, number> = {};
    for (const role of roles) {
      const cnt = await this.prisma.user.count({
        where: { role },
      });
      // Make sure the role is included in the result even if count is 0
      result[role] = cnt;
    }

    // Log the result to verify SUPERVISOR is included
    console.log('Count by role result:', result);

    return result;
  }

  async countByGender(): Promise<{ L: number; P: number }> {
    // Hitung user dengan jenisKelamin 'L'
    const countL = await this.prisma.user.count({
      where: { jenisKelamin: 'L' },
    });
    // Hitung user dengan jenisKelamin 'P'
    const countP = await this.prisma.user.count({
      where: { jenisKelamin: 'P' },
    });
    return { L: countL, P: countP };
  }

  /**
   * 1️⃣ Ambil semua user (tanpa field password)
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        username: true,
        email: true,
        namaDepan: true,
        namaBelakang: true,
        alamat: true,
        noHp: true,
        jenisKelamin: true,
        tanggalLahir: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 2️⃣ Ambil satu user berdasarkan ID
   */
  async findOne(id: number) {
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
        jenisKelamin: true,
        tanggalLahir: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    return user;
  }

  /**
   * 3️⃣ Buat user baru
   */
  async create(data: CreateUserDto) {
    // 3.a) Periksa apakah username atau email sudah terpakai
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(data.username ? [{ username: data.username }] : []),
          { email: data.email },
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Username atau email sudah terdaftar');
    }

    // 3.b) Hash password
    const hashed = await bcrypt.hash(data.password, 10);

    // 3.c) Convert tanggalLahir ke Date object (only if provided)
    let tanggal: Date | undefined = undefined;
    if (data.tanggalLahir) {
      tanggal = new Date(data.tanggalLahir);
    }

    // 3.d) Generate employeeId
    const role = data.role ?? 'STAF';
    const rolePrefix = this.getRolePrefix(role);
    const employeeId = await this.generateEmployeeId(rolePrefix);

    // 3.e) Simpan ke database
    const createdUser = await this.prisma.user.create({
      data: {
        employeeId: employeeId,
        username: data.username ?? '',
        email: data.email ?? '',
        password: hashed,
        namaDepan: data.namaDepan ?? '',
        namaBelakang: data.namaBelakang ?? '',
        alamat: data.alamat ?? null,
        noHp: data.noHp ?? '',
        jenisKelamin: data.jenisKelamin ?? '',
        tanggalLahir: tanggal ?? new Date('1970-01-01'),
        role: data.role ?? 'STAF',
        status: data.status ?? 'ACTIVE',
      },
      // 3.e) Hanya return field yang diperlukan, tanpa password
      select: {
        id: true,
        username: true,
        email: true,
        namaDepan: true,
        namaBelakang: true,
        alamat: true,
        noHp: true,
        jenisKelamin: true,
        tanggalLahir: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createdUser;
  }

  /**
   * 4️⃣ Update user berdasarkan ID
   */
  async update(id: number, data: UpdateUserDto) {
    // 4.a) Periksa dulu apakah user ada
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    // 4.b) Mempersiapkan objek update
    const updateData: any = { ...data };

    // Jika ada password baru, hash dulu
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Jika ada tanggalLahir, convert ke Date
    if (data.tanggalLahir) {
      updateData.tanggalLahir = new Date(data.tanggalLahir);
    }

    // 4.c) Jalankan update
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        namaDepan: true,
        namaBelakang: true,
        alamat: true,
        noHp: true,
        jenisKelamin: true,
        tanggalLahir: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * 5️⃣ Hapus user berdasarkan ID
   */
  async delete(id: number) {
    // 5.a) Periksa dulu apakah user ada
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User Dengan ID ${id} Tidak Ditemukan`);
    }

    // 5.b) Hapus
    const removed = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return removed;
  }

  /**
   * Helper method to get role prefix for employeeId
   */
  private getRolePrefix(role: Role): string {
    const prefixMap: Record<Role, string> = {
      ADMIN: 'ADM',
      DOKTER: 'DOK',
      PERAWAT: 'PER',
      STAF: 'STA',
      SUPERVISOR: 'SUP',
    };
    return prefixMap[role] || 'USR';
  }

  /**
   * Helper method to generate unique employeeId
   */
  private async generateEmployeeId(prefix: string): Promise<string> {
    // Find the highest existing employeeId with this prefix
    const existingUsers = await this.prisma.user.findMany({
      where: {
        employeeId: {
          startsWith: prefix,
        },
      },
      select: {
        employeeId: true,
      },
      orderBy: {
        employeeId: 'desc',
      },
    });

    let nextNumber = 1;
    if (existingUsers.length > 0) {
      // Extract number from the latest employeeId
      const latestId = existingUsers[0].employeeId;
      const numberPart = latestId.replace(prefix, '');
      nextNumber = parseInt(numberPart) + 1;
    }

    // Format with leading zeros (e.g., ADM001)
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }
}

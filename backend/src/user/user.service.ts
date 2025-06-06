/* eslint-disable prettier/prettier */
// src/user/user.service.ts
// eslint-disable-next-line prettier/prettier
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

   async countByRole(): Promise<Record<string, number>> {
    // Enum Role di Prisma: ADMIN, DOKTER, PERAWAT, STAF
    const roles: Role[] = ['ADMIN', 'DOKTER', 'PERAWAT', 'STAF'];

    const result: Record<string, number> = {};
    for (const role of roles) {
      const cnt = await this.prisma.user.count({
        where: { role },
      });
      result[role] = cnt;
    }
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
        OR: [{ username: data.username }, { email: data.email }],
      },
    });
    if (existing) {
      throw new BadRequestException('Username atau email sudah terdaftar');
    }

    // 3.b) Hash password
    const hashed = await bcrypt.hash(data.password, 10);

    // 3.c) Convert tanggalLahir ke Date object
    const tanggal = new Date(data.tanggalLahir);

    // 3.d) Simpan ke database
    const createdUser = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        namaDepan: data.namaDepan,
        namaBelakang: data.namaBelakang,
        alamat: data.alamat ?? null,
        noHp: data.noHp,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: tanggal,
        role: data.role,
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
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
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
}

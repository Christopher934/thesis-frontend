// backend/src/pegawai/pegawai.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PegawaiService {
  constructor(private readonly prisma: PrismaService) {}

  async remove(id: number): Promise<void> {
    try {
      // Misalkan data "pegawai" disimpan dalam model "User" di Prisma.
      // Jika Anda punya model Pegawai terpisah di Prisma, ganti `user` menjadi `pegawai`.
      await this.prisma.user.delete({ where: { id } });
    } catch (error: any) {
      // Jika error.code === 'P2025', berarti record tidak ditemukan
      if (error.code === 'P2025') {
        throw new NotFoundException(`Data pegawai dengan id ${id} tidak ditemukan.`);
      }
      // Lempar error lain (misalnya koneksi database gagal)
      throw error;
    }
  }
}

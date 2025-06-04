// backend/src/pegawai/pegawai.module.ts

import { Module } from '@nestjs/common';
import { PegawaiController } from './pegawai.controller';
import { PegawaiService } from './pegawai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PegawaiController],
  providers: [PegawaiService, PrismaService],
})
export class PegawaiModule {}

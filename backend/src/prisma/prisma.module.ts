// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // opsional: agar tersedia secara global
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

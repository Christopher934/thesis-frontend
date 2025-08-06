import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShiftModule } from './shift/shift.module'; // Import ShiftModule
import { KegiatanModule } from './kegiatan/kegiatan.module'; // Import KegiatanModule
import { AbsensiModule } from './absensi/absensi.module'; // Import AbsensiModule
import { NotifikasiModule } from './notifikasi/notifikasi.module'; // Import NotifikasiModule
import { LaporanModule } from './laporan/laporan.module'; // Import LaporanModule
import { OverworkModule } from './overwork/overwork.module'; // Import OverworkModule
import { AdminShiftOptimizationService } from './shift/admin-shift-optimization.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module global so it can be used anywhere
      envFilePath: '.env', // Explicitly specify the .env file path
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    ShiftModule,
    KegiatanModule,
    AbsensiModule,
    NotifikasiModule,
    LaporanModule,
    OverworkModule,
  ], // Tambahkan ShiftModule, KegiatanModule, dan AbsensiModule
  controllers: [AppController],
  providers: [PrismaService, AppService, AdminShiftOptimizationService],
})
export class AppModule {}

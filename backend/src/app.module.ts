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
  ], // Tambahkan ShiftModule, KegiatanModule, dan AbsensiModule
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}

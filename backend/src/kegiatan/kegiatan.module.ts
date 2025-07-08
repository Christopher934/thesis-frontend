import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [PrismaModule, NotifikasiModule],
  providers: [KegiatanService],
  controllers: [KegiatanController],
})
export class KegiatanModule {}

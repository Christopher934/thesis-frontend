import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PegawaiModule } from './pegawai/pegawai.module';


@Module({
  imports: [AuthModule, UserModule, PrismaModule, PegawaiModule],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule { }

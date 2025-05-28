import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ pastikan ini ditambahkan

@Module({
  imports: [PrismaModule], // ✅ tambahkan di sini
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }

// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Definisi login menerima dua parameter: email dan password
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Email atau password salah');

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        namaDepan: user.namaDepan,
        namaBelakang: user.namaBelakang,
        email: user.email,
        role: user.role,
      },
    };
  }
}

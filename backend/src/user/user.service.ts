// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    // Get all users
    async findAll() {
        return this.prisma.user.findMany();
    }

    // Get single user by id
    async findOne(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    // Create new user
    async create(data: { email: string; password: string; status: string; role: 'ADMIN' | 'DOKTER' | 'PERAWAT' | 'STAF' }) {
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                status: data.status,
                role: data.role, // ← ini penting
            },
        });
    }


    // Update user
    async update(id: number, data: any) {
        return this.prisma.user.update({ where: { id }, data });
    }

    // Delete user
    async delete(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }
}

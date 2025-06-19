import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class KegiatanService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.kegiatan.findMany();
  }

  async findOne(id: number) {
    return this.prisma.kegiatan.findUnique({ where: { id } });
  }

  async create(data: any): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.prisma.kegiatan.create({ data });
  }

  async update(id: number, data: any): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return await this.prisma.kegiatan.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Event not found');
        }
      }
      // Fallback: convert error to string for message
      let msg = 'Failed to update event';
      if (
        error &&
        typeof error === 'object' &&
        error !== null &&
        Object.prototype.hasOwnProperty.call(error, 'message')
      ) {
        msg = String((error as { message?: unknown }).message);
      }
      throw new BadRequestException(msg);
    }
  }

  async remove(id: number) {
    return this.prisma.kegiatan.delete({ where: { id } });
  }
}

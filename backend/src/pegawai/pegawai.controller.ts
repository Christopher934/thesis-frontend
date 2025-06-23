// backend/src/pegawai/pegawai.controller.ts

import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PegawaiService } from './pegawai.service';

@Controller('pegawai')
export class PegawaiController {
  constructor(private readonly pegawaiService: PegawaiService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // akan mereturn HTTP 204 jika sukses
  async remove(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    await this.pegawaiService.remove(idNum);
    // Karena HttpCode-nya NO_CONTENT, kita tidak perlu return apa‐apa
  }
}
